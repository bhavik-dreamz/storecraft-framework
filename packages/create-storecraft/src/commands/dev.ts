import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import ora from 'ora'

interface DevOptions {
  port?: number
  host?: string
  open?: boolean
}

export async function startDevServer(options: DevOptions) {
  try {
    // Check if we're in a StoreCraft project
    if (!await isStoreCraftProject()) {
      console.error(chalk.red('Not in a StoreCraft project directory'))
      console.log(chalk.dim('Create a new project with: myshop create <project-name>'))
      process.exit(1)
    }

    const port = options.port || 3000
    const host = options.host || 'localhost'

    console.log(chalk.blue('Starting StoreCraft development server...'))
    console.log(chalk.dim(`Server will run on http://${host}:${port}`))

    // Check if dependencies are installed
    if (!await fs.pathExists(path.join(process.cwd(), 'node_modules'))) {
      const spinner = ora('Installing dependencies...').start()
      await installDependencies()
      spinner.succeed('Dependencies installed')
    }

    // Start Next.js development server
    const args = ['run', 'dev']
    
    if (options.port) {
      args.push('--', '--port', options.port.toString())
    }
    if (options.host && options.host !== 'localhost') {
      args.push('--hostname', options.host)
    }

    console.log(chalk.green('🚀 Starting development server...\n'))

    const devProcess = spawn('npm', args, {
      stdio: 'inherit',
      cwd: process.cwd(),
      shell: true
    })

    // Handle process termination
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\n👋 Shutting down development server...'))
      devProcess.kill('SIGINT')
      process.exit(0)
    })

    devProcess.on('error', (error) => {
      console.error(chalk.red('Failed to start development server:'), error)
      process.exit(1)
    })

    devProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error(chalk.red(`Development server exited with code ${code}`))
        process.exit(code || 1)
      }
    })

  } catch (error) {
    console.error(chalk.red('Error starting development server:'), error)
    process.exit(1)
  }
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