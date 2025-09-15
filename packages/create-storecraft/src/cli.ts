#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import { createProject } from './commands/create.js'
import { manageThemes } from './commands/theme.js'
import { startDevServer } from './commands/dev.js'
import { buildProject } from './commands/build.js'
import { deployProject } from './commands/deploy.js'

const program = new Command()

program
  .name('storecraft')
  .description('StoreCraft CLI - Build modern Shopify headless stores')
  .version('1.0.0')

// Create command (also default when called as create-myshop)
program
  .command('create [project-name]')
  .description('Create a new StoreCraft project')
  .option('-t, --template <template>', 'Project template', 'default')
  .option('-y, --yes', 'Skip interactive prompts and use defaults')
  .option('--theme <theme>', 'Initial theme to use', 'default')
  .action(createProject)

// Theme management commands
const themeCmd = program
  .command('theme')
  .description('Manage themes')

themeCmd
  .command('list')
  .description('List available themes')
  .action(() => manageThemes('list', { list: true }))

themeCmd
  .command('switch <theme-name>')
  .description('Switch to a different theme')
  .action((themeName) => manageThemes('switch', { switch: themeName }))

themeCmd
  .command('install <theme>')
  .description('Install a theme')
  .action((theme) => manageThemes('install', { install: theme }))

// Development command
program
  .command('dev')
  .description('Start development server')
  .option('-p, --port <port>', 'Port to run on', '3000')
  .option('-H, --host <host>', 'Host to bind to', 'localhost')
  .option('--open', 'Open browser automatically')
  .action((options) => {
    const devOptions = {
      port: options.port ? parseInt(options.port) : 3000,
      host: options.host,
      open: options.open
    }
    startDevServer(devOptions)
  })

// Build command  
program
  .command('build')
  .description('Build project for production')
  .option('-a, --analyze', 'Analyze bundle size')
  .option('--standalone', 'Create standalone build')
  .action((options) => buildProject(options))

// Start command for production
program
  .command('start')
  .description('Start production server')
  .option('-p, --port <port>', 'Port to run on', '3000')
  .option('-H, --host <host>', 'Host to bind to', 'localhost')
  .action((options) => {
    const startOptions = {
      port: options.port ? parseInt(options.port) : 3000,
      host: options.host
    }
    // Use spawnSync to run Next.js start command
    const { spawn } = require('child_process')
    console.log(chalk.blue('Starting StoreCraft production server...'))
    spawn('npx', ['next', 'start', '-p', startOptions.port.toString()], { stdio: 'inherit' })
  })

// Deploy commands
program
  .command('deploy')
  .description('Deploy to hosting platform')
  .option('-p, --platform <platform>', 'Deployment platform')
  .option('--build', 'Build before deployment')
  .option('--env <env>', 'Environment to deploy to')
  .action((options) => deployProject(options))

// Handle create-storecraft direct usage (only when called as create-storecraft with no subcommands)
if (process.argv[1].includes('create-storecraft') && process.argv.length <= 3) {
  const projectName = process.argv[2]
  if (projectName && !projectName.startsWith('-')) {
    // When called as create-storecraft with project name, treat it as create command
    createProject(projectName, { template: 'default', yes: false, theme: 'default' })
  } else {
    // No project name provided, show help or run interactive create
    createProject(undefined, { template: 'default', yes: false, theme: 'default' })
  }
} else {
  // Normal command parsing for storecraft command or create-storecraft with subcommands
  program.parse()
}

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`))
  console.log('See --help for a list of available commands.')
  process.exit(1)
})

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp()
}