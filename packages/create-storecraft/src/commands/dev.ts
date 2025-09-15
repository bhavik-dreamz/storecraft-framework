import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import chalk from 'chalk'
import { promises as fs } from 'fs'
import ora from 'ora'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface DevOptions {
  port?: number
  host?: string
  open?: boolean
}

async function isStoreCraftProject(): Promise<boolean> {
  try {
    const packageJsonPath = join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
    return !!packageJson.dependencies?.['storecraft-framework']
  } catch {
    return false
  }
}

async function installDependencies(): Promise<void> {
  const child = spawn('npm', ['install'], {
    stdio: 'inherit',
    shell: true
  })
  
  return new Promise((resolve, reject) => {
    child.on('exit', code => {
      if (code === 0) resolve()
      else reject(new Error(`npm install failed with code ${code}`))
    })
  })
}

export async function startDevServer(options: DevOptions) {
  try {
    // Load environment variables from common Next.js locations
    const envPaths = [
      '.env.local',
      '.env.development.local',
      '.env.development',
      '.env'
    ]
    for (const p of envPaths) {
      try {
        dotenv.config({ path: join(process.cwd(), p) })
      } catch {}
    }

    // Check if we're in a StoreCraft project
    if (!await isStoreCraftProject()) {
      console.error(chalk.red('Not in a StoreCraft project directory'))
      console.log(chalk.dim('Create a new project with: storecraft create <project-name>'))
      process.exit(1)
    }

    const port = options.port || 3000
    const host = options.host || 'localhost'

    console.log(chalk.blue('Starting StoreCraft development server...'))
    console.log(chalk.dim(`Server will run on http://${host}:${port}`))

    // Check if dependencies are installed
    try {
      await fs.access(join(process.cwd(), 'node_modules'))
    } catch {
      const spinner = ora('Installing dependencies...').start()
      await installDependencies()
      spinner.succeed('Dependencies installed')
    }

    // Start StoreCraft development process
    console.log(chalk.blue('🔨 Initializing StoreCraft Framework...'))
    
    // Use node with explicit ESM flags for Next.js
    const nextProcess = spawn('npx', ['--node-options=--experimental-import-meta-resolve', 'next', 'dev', '--port', port.toString()], {
      stdio: ['inherit', 'pipe', 'pipe'],
      cwd: process.cwd(),
      env: {
        ...process.env,
        FORCE_COLOR: '1',
        STORECRAFT_MODE: 'development',
        NODE_OPTIONS: '--experimental-vm-modules --experimental-import-meta-resolve'
      }
    })

    // Initialize StoreCraft Framework
    console.log(chalk.green('🚀 Initializing StoreCraft services...\n'))
    
    // Initialize theme and services directly
    try {
      const storecraftPath = 'file://' + join(process.cwd(), 'node_modules/storecraft-framework/dist/index.js')
      const storecraftModule = await import(storecraftPath)
      
      await storecraftModule.initializeStoreCraft({
        port,
        host
      })
    } catch (error) {
      console.error('Failed to initialize StoreCraft:', error)
      nextProcess.kill()
      process.exit(1)
    }

    // Handle Next.js output
    nextProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString()
      if (output.includes('ready')) {
        console.log(chalk.green('✨ Next.js ready'))
        console.log(chalk.blue('\n🌐 App running at:'), chalk.cyan(`http://${host}:${port}`))
      }
    })

    nextProcess.stderr?.on('data', (data: Buffer) => {
      const errorOutput = data.toString()
      if (!errorOutput.includes('warning')) {
        console.error(chalk.red('Next.js error:'), errorOutput)
      }
    })

    // Handle process termination
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\nShutting down StoreCraft...'))
      nextProcess.kill('SIGINT')
      process.exit(0)
    })

    nextProcess.on('error', (error: Error) => {
      console.error('Next.js server error:', error)
      process.exit(1)
    })

    nextProcess.on('exit', (code: number | null) => {
      if (code !== 0 && code !== null) {
        console.error(`Next.js server exited with code ${code}`)
        process.exit(code)
      }
    })

  } catch (error) {
    console.error(chalk.red('Error starting development server:'), error)
    process.exit(1)
  }
}