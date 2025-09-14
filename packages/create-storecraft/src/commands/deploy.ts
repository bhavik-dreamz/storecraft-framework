import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import inquirer from 'inquirer'
import ora from 'ora'

interface DeployOptions {
  platform?: string
  build?: boolean
  env?: string
}

const SUPPORTED_PLATFORMS = [
  { name: 'Vercel', value: 'vercel' },
  { name: 'Netlify', value: 'netlify' },
  { name: 'AWS Amplify', value: 'amplify' },
  { name: 'Railway', value: 'railway' },
  { name: 'Custom/Manual', value: 'manual' }
]

export async function deployProject(options: DeployOptions) {
  try {
    // Check if we're in a StoreCraft project
    if (!await isStoreCraftProject()) {
      console.error(chalk.red('Not in a StoreCraft project directory'))
      console.log(chalk.dim('Create a new project with: myshop create <project-name>'))
      process.exit(1)
    }

    let platform = options.platform

    // If platform not specified, ask user
    if (!platform) {
      const { selectedPlatform } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedPlatform',
          message: 'Choose deployment platform:',
          choices: SUPPORTED_PLATFORMS
        }
      ])
      platform = selectedPlatform
    }

    // Build the project if requested or if not built yet
    if (options.build || !await isBuildExists()) {
      const spinner = ora('Building project for deployment...').start()
      await buildForDeployment()
      spinner.succeed('Build completed')
    }

    // Deploy based on platform
    switch (platform) {
      case 'vercel':
        await deployToVercel(options)
        break
      case 'netlify':
        await deployToNetlify(options)
        break
      case 'amplify':
        await deployToAmplify(options)
        break
      case 'railway':
        await deployToRailway(options)
        break
      case 'manual':
        await showManualDeploymentInstructions()
        break
      default:
        console.error(chalk.red(`Unsupported platform: ${platform}`))
        process.exit(1)
    }

  } catch (error) {
    console.error(chalk.red('Deployment failed:'), error)
    process.exit(1)
  }
}

async function deployToVercel(options: DeployOptions) {
  console.log(chalk.blue('🚀 Deploying to Vercel...'))

  // Check if Vercel CLI is installed
  const hasVercelCli = await checkCommand('vercel')
  
  if (!hasVercelCli) {
    console.log(chalk.yellow('Vercel CLI not found. Installing...'))
    await installCommand('vercel')
  }

  // Create vercel.json if it doesn't exist
  await ensureVercelConfig()

  // Set up environment variables
  await setupVercelEnvironment()

  // Deploy
  const spinner = ora('Deploying to Vercel...').start()
  
  try {
    const args = ['--prod']
    if (options.env) {
      args.push('--env', options.env)
    }

    await runCommand('vercel', args)
    spinner.succeed('Successfully deployed to Vercel!')
    
    console.log('\n' + chalk.green('✨ Deployment completed!'))
    console.log(chalk.dim('Your site is now live on Vercel'))
    
  } catch (error) {
    spinner.fail('Deployment to Vercel failed')
    throw error
  }
}

async function deployToNetlify(options: DeployOptions) {
  console.log(chalk.blue('🚀 Deploying to Netlify...'))

  const hasNetlifyCli = await checkCommand('netlify')
  
  if (!hasNetlifyCli) {
    console.log(chalk.yellow('Netlify CLI not found. Installing...'))
    await installCommand('netlify-cli')
  }

  // Create netlify.toml if it doesn't exist
  await ensureNetlifyConfig()

  const spinner = ora('Deploying to Netlify...').start()
  
  try {
    await runCommand('netlify', ['deploy', '--prod', '--dir=out'])
    spinner.succeed('Successfully deployed to Netlify!')
    
    console.log('\n' + chalk.green('✨ Deployment completed!'))
    console.log(chalk.dim('Your site is now live on Netlify'))
    
  } catch (error) {
    spinner.fail('Deployment to Netlify failed')
    throw error
  }
}

async function deployToAmplify(options: DeployOptions) {
  console.log(chalk.blue('🚀 Setting up AWS Amplify deployment...'))
  
  console.log(chalk.yellow('AWS Amplify deployment requires manual setup:'))
  console.log('\n1. Push your code to a Git repository')
  console.log('2. Go to AWS Amplify Console: https://console.aws.amazon.com/amplify/')
  console.log('3. Connect your repository')
  console.log('4. Use these build settings:')
  
  const buildSettings = `
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: out
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
`
  
  console.log(chalk.cyan(buildSettings))
  console.log('5. Add environment variables in Amplify console')
  
  await showEnvironmentVariables()
}

async function deployToRailway(options: DeployOptions) {
  console.log(chalk.blue('🚀 Deploying to Railway...'))

  const hasRailwayCli = await checkCommand('railway')
  
  if (!hasRailwayCli) {
    console.log(chalk.yellow('Railway CLI not found. Installing...'))
    await installCommand('@railway/cli')
  }

  // Create railway.json if it doesn't exist
  await ensureRailwayConfig()

  const spinner = ora('Deploying to Railway...').start()
  
  try {
    await runCommand('railway', ['up'])
    spinner.succeed('Successfully deployed to Railway!')
    
    console.log('\n' + chalk.green('✨ Deployment completed!'))
    console.log(chalk.dim('Your site is now live on Railway'))
    
  } catch (error) {
    spinner.fail('Deployment to Railway failed')
    throw error
  }
}

async function showManualDeploymentInstructions() {
  console.log(chalk.blue('📋 Manual Deployment Instructions'))
  console.log(chalk.dim('━'.repeat(50)))
  
  console.log('\n' + chalk.bold('1. Build the project:'))
  console.log('   npm run build')
  
  console.log('\n' + chalk.bold('2. Static export (optional):'))
  console.log('   Add to next.config.js: output: "export"')
  console.log('   Files will be in the "out" directory')
  
  console.log('\n' + chalk.bold('3. Environment Variables:'))
  await showEnvironmentVariables()
  
  console.log('\n' + chalk.bold('4. Deploy options:'))
  console.log('   • Static hosting: Use the "out" directory')
  console.log('   • Server deployment: Use "npm start" after build')
  console.log('   • Docker: Create Dockerfile with Node.js base image')
  
  console.log('\n' + chalk.bold('5. Required files:'))
  console.log('   • .next/ (or out/ for static)')
  console.log('   • package.json')
  console.log('   • public/')
  console.log('   • node_modules/ (if not installing on server)')
}

async function ensureVercelConfig() {
  const configPath = path.join(process.cwd(), 'vercel.json')
  
  if (!await fs.pathExists(configPath)) {
    const config = {
      buildCommand: 'npm run build',
      outputDirectory: '.next',
      framework: 'nextjs',
      regions: ['iad1'],
      env: {
        SHOPIFY_DOMAIN: '@shopify-domain',
        SHOPIFY_STOREFRONT_ACCESS_TOKEN: '@shopify-storefront-token'
      }
    }
    
    await fs.writeJson(configPath, config, { spaces: 2 })
    console.log(chalk.green('Created vercel.json configuration'))
  }
}

async function ensureNetlifyConfig() {
  const configPath = path.join(process.cwd(), 'netlify.toml')
  
  if (!await fs.pathExists(configPath)) {
    const config = `
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`.trim()
    
    await fs.writeFile(configPath, config)
    console.log(chalk.green('Created netlify.toml configuration'))
  }
}

async function ensureRailwayConfig() {
  const configPath = path.join(process.cwd(), 'railway.json')
  
  if (!await fs.pathExists(configPath)) {
    const config = {
      build: {
        builder: 'nixpacks'
      },
      deploy: {
        startCommand: 'npm start',
        healthcheckPath: '/'
      }
    }
    
    await fs.writeJson(configPath, config, { spaces: 2 })
    console.log(chalk.green('Created railway.json configuration'))
  }
}

async function setupVercelEnvironment() {
  console.log(chalk.yellow('Setting up environment variables...'))
  
  const envPath = path.join(process.cwd(), '.env.local')
  if (await fs.pathExists(envPath)) {
    console.log(chalk.dim('Add these environment variables to your Vercel project:'))
    
    const envContent = await fs.readFile(envPath, 'utf-8')
    const lines = envContent.split('\n').filter(line => 
      line.trim() && !line.startsWith('#')
    )
    
    for (const line of lines) {
      const [key] = line.split('=')
      if (key) {
        console.log(`   vercel env add ${key}`)
      }
    }
  }
}

async function showEnvironmentVariables() {
  const envPath = path.join(process.cwd(), '.env.local')
  
  if (await fs.pathExists(envPath)) {
    console.log(chalk.dim('Environment variables needed:'))
    
    const envContent = await fs.readFile(envPath, 'utf-8')
    const lines = envContent.split('\n').filter(line => 
      line.trim() && !line.startsWith('#')
    )
    
    for (const line of lines) {
      const [key, value] = line.split('=')
      if (key && value) {
        console.log(`   ${chalk.yellow(key)}: ${value.includes('your-') ? chalk.red(value) : chalk.green('***')}`)
      }
    }
  }
}

async function buildForDeployment(): Promise<void> {
  return new Promise((resolve, reject) => {
    const buildProcess = spawn('npm', ['run', 'build'], {
      cwd: process.cwd(),
      shell: true,
      stdio: 'pipe'
    })

    buildProcess.on('error', reject)
    buildProcess.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Build process exited with code ${code}`))
      }
    })
  })
}

async function checkCommand(command: string): Promise<boolean> {
  try {
    await runCommand(command, ['--version'])
    return true
  } catch (error) {
    return false
  }
}

async function installCommand(packageName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const installProcess = spawn('npm', ['install', '-g', packageName], {
      shell: true,
      stdio: 'inherit'
    })

    installProcess.on('error', reject)
    installProcess.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Failed to install ${packageName}`))
      }
    })
  })
}

async function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, {
      cwd: process.cwd(),
      shell: true,
      stdio: 'inherit'
    })

    childProcess.on('error', reject)
    childProcess.on('exit', (code: number | null) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command ${command} exited with code ${code}`))
      }
    })
  })
}

async function isBuildExists(): Promise<boolean> {
  return await fs.pathExists(path.join(process.cwd(), '.next'))
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