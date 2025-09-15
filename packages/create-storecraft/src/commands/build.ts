import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import ora from 'ora'

interface BuildOptions {
  output?: string
  analyze?: boolean
  standalone?: boolean
}

export async function buildProject(options: BuildOptions) {
  try {
    // Check if we're in a StoreCraft project
    if (!await isStoreCraftProject()) {
      console.error(chalk.red('Not in a StoreCraft project directory'))
      console.log(chalk.dim('Create a new project with: myshop create <project-name>'))
      process.exit(1)
    }

    const spinner = ora('Building StoreCraft project...').start()

    // Check if dependencies are installed
    if (!await fs.pathExists(path.join(process.cwd(), 'node_modules'))) {
      spinner.text = 'Installing dependencies...'
      await installDependencies()
    }

    // Run type checking first
    spinner.text = 'Running type checks...'
    await runTypeCheck()

    // Build the project
    spinner.text = 'Building for production...'
    await runBuild(options)

    spinner.succeed('Build completed successfully!')

    // Display build info
    await displayBuildInfo(options)

  } catch (error) {
    console.error(chalk.red('Build failed:'), error)
    process.exit(1)
  }
}

async function runBuild(options: BuildOptions): Promise<void> {
  // Make sure the next.config.mjs exists before building
  try {
    await fs.access(path.join(process.cwd(), 'next.config.mjs'))
  } catch {
    console.log(chalk.yellow('Creating default Next.js configuration for build...'))
    const defaultConfig = `
import withStorecraft from 'storecraft-framework/next-plugin';

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
};

export default withStorecraft({
  themesPath: './themes',
})(baseConfig);
    `.trim()
    await fs.writeFile(path.join(process.cwd(), 'next.config.mjs'), defaultConfig)
  }
  
  return new Promise((resolve, reject) => {
    const args = ['run', 'build']

    // Add environment variables for build options
    const env = { ...process.env }
    
    if (options.analyze) {
      env.ANALYZE = 'true'
    }
    
    if (options.standalone) {
      env.BUILD_STANDALONE = 'true'
    }

    const buildProcess = spawn('npm', args, {
      cwd: process.cwd(),
      shell: true,
      env,
      stdio: 'pipe'
    })

    let output = ''
    let errorOutput = ''

    buildProcess.stdout?.on('data', (data) => {
      output += data.toString()
    })

    buildProcess.stderr?.on('data', (data) => {
      errorOutput += data.toString()
    })

    buildProcess.on('error', reject)
    buildProcess.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        console.error(chalk.red('Build output:'))
        console.error(output)
        console.error(errorOutput)
        reject(new Error(`Build process exited with code ${code}`))
      }
    })
  })
}

async function runTypeCheck(): Promise<void> {
  return new Promise((resolve, reject) => {
    const typeCheckProcess = spawn('npm', ['run', 'type-check'], {
      cwd: process.cwd(),
      shell: true,
      stdio: 'pipe'
    })

    let errorOutput = ''

    typeCheckProcess.stderr?.on('data', (data) => {
      errorOutput += data.toString()
    })

    typeCheckProcess.on('error', reject)
    typeCheckProcess.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        if (errorOutput) {
          console.error(chalk.red('Type check errors:'))
          console.error(errorOutput)
        }
        reject(new Error('Type checking failed'))
      }
    })
  })
}

async function displayBuildInfo(options: BuildOptions) {
  const buildDir = path.join(process.cwd(), '.next')
  const packageJsonPath = path.join(process.cwd(), 'package.json')

  console.log('\n' + chalk.green('✨ Build Summary'))
  console.log(chalk.dim('━'.repeat(50)))

  // Project info
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath)
    console.log(chalk.bold('Project:'), packageJson.name)
    console.log(chalk.bold('Version:'), packageJson.version || '1.0.0')
  }

  // Build info
  console.log(chalk.bold('Output:'), path.relative(process.cwd(), buildDir))
  
  if (options.analyze) {
    console.log(chalk.bold('Bundle Analysis:'), chalk.blue('Generated'))
  }
  
  if (options.standalone) {
    console.log(chalk.bold('Standalone:'), chalk.green('Enabled'))
  }

  // File sizes (if available)
  try {
    const staticDir = path.join(buildDir, 'static')
    if (await fs.pathExists(staticDir)) {
      const stats = await getBuildStats(staticDir)
      console.log(chalk.bold('JavaScript:'), formatBytes(stats.js))
      console.log(chalk.bold('CSS:'), formatBytes(stats.css))
    }
  } catch (error) {
    // Ignore errors getting build stats
  }

  console.log('\n' + chalk.bold('Next Steps:'))
  console.log('• Test your build: ' + chalk.cyan('npm start'))
  console.log('• Deploy your app: ' + chalk.cyan('myshop deploy'))
  console.log('• Analyze bundle: ' + chalk.cyan('myshop build --analyze'))
  console.log('')
}

async function getBuildStats(staticDir: string) {
  let jsSize = 0
  let cssSize = 0

  const walkDir = async (dir: string) => {
    const files = await fs.readdir(dir)
    
    for (const file of files) {
      const filePath = path.join(dir, file)
      const stat = await fs.stat(filePath)
      
      if (stat.isDirectory()) {
        await walkDir(filePath)
      } else {
        const ext = path.extname(file)
        if (ext === '.js') {
          jsSize += stat.size
        } else if (ext === '.css') {
          cssSize += stat.size
        }
      }
    }
  }

  await walkDir(staticDir)
  
  return { js: jsSize, css: cssSize }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

async function isStoreCraftProject(): Promise<boolean> {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath)
      return packageJson.dependencies && 
             packageJson.dependencies['storecraft-framework']
    }
    return false
  } catch (error) {
    return false
  }
}

async function installDependencies(): Promise<void> {
  return new Promise((resolve, reject) => {
    const installProcess = spawn('npm', ['install'], {
      cwd: process.cwd(),
      shell: true
    })

    installProcess.on('error', reject)
    installProcess.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`npm install exited with code ${code}`))
      }
    })
  })
}