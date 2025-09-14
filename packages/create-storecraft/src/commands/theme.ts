import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import inquirer from 'inquirer'

interface ThemeOptions {
  list?: boolean
  install?: string
  switch?: string
}

export async function manageThemes(command: string | undefined, options: ThemeOptions) {
  const themesDir = path.join(process.cwd(), 'themes')

  try {
    switch (command) {
      case 'list':
        await listThemes(themesDir)
        break
      case 'install':
        if (!options.install) {
          console.error(chalk.red('Theme name is required for install'))
          process.exit(1)
        }
        await installTheme(themesDir, options.install)
        break
      case 'switch':
        if (!options.switch) {
          console.error(chalk.red('Theme name is required for switch'))
          process.exit(1)
        }
        await switchTheme(options.switch)
        break
      default:
        // Interactive theme management
        await interactiveThemeManagement(themesDir)
    }
  } catch (error) {
    console.error(chalk.red('Error managing themes:'), error)
    process.exit(1)
  }
}

async function listThemes(themesDir: string) {
  console.log(chalk.bold('\n📦 Available Themes:\n'))

  if (!await fs.pathExists(themesDir)) {
    console.log(chalk.yellow('No themes directory found. Run in a StoreCraft project.'))
    return
  }

  const themes = await fs.readdir(themesDir)
  const currentTheme = await getCurrentTheme()

  if (themes.length === 0) {
    console.log(chalk.yellow('No themes installed.'))
    console.log(chalk.dim('Install themes with: myshop theme install <theme-name>'))
    return
  }

  for (const theme of themes) {
    const themePath = path.join(themesDir, theme)
    const stat = await fs.stat(themePath)
    
    if (stat.isDirectory()) {
      const isActive = theme === currentTheme
      const prefix = isActive ? chalk.green('✓') : ' '
      const themeInfo = await getThemeInfo(themePath)
      
      console.log(`${prefix} ${chalk.bold(theme)} ${isActive ? chalk.green('(active)') : ''}`)
      if (themeInfo.description) {
        console.log(`  ${chalk.dim(themeInfo.description)}`)
      }
      if (themeInfo.version) {
        console.log(`  ${chalk.dim('Version:')} ${themeInfo.version}`)
      }
      console.log()
    }
  }
}

async function installTheme(themesDir: string, themeName: string) {
  console.log(chalk.blue(`Installing theme: ${themeName}`))
  
  await fs.ensureDir(themesDir)
  const themePath = path.join(themesDir, themeName)

  if (await fs.pathExists(themePath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Theme ${themeName} already exists. Overwrite?`,
        default: false
      }
    ])
    
    if (!overwrite) {
      console.log(chalk.yellow('Installation cancelled'))
      return
    }
  }

  // Create theme from template
  await createThemeFromTemplate(themePath, themeName)
  
  console.log(chalk.green(`✓ Theme ${themeName} installed successfully`))
  console.log(chalk.dim(`Switch to it with: myshop theme switch ${themeName}`))
}

async function switchTheme(themeName: string) {
  const themesDir = path.join(process.cwd(), 'themes')
  const themePath = path.join(themesDir, themeName)

  if (!await fs.pathExists(themePath)) {
    console.error(chalk.red(`Theme ${themeName} not found`))
    console.log(chalk.dim('List available themes with: myshop theme list'))
    process.exit(1)
  }

  // Update environment variable
  await updateActiveTheme(themeName)
  
  console.log(chalk.green(`✓ Switched to theme: ${themeName}`))
  console.log(chalk.dim('Restart your development server to see changes'))
}

async function interactiveThemeManagement(themesDir: string) {
  const themes = await fs.pathExists(themesDir) 
    ? (await fs.readdir(themesDir)).filter(async (theme) => {
        const stat = await fs.stat(path.join(themesDir, theme))
        return stat.isDirectory()
      })
    : []

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'List installed themes', value: 'list' },
        { name: 'Install a new theme', value: 'install' },
        themes.length > 0 ? { name: 'Switch theme', value: 'switch' } : null,
        { name: 'Create custom theme', value: 'create' }
      ].filter(Boolean)
    }
  ])

  switch (action) {
    case 'list':
      await listThemes(themesDir)
      break
    case 'install':
      const { themeName } = await inquirer.prompt([
        {
          type: 'list',
          name: 'themeName',
          message: 'Select theme to install:',
          choices: ['modern', 'minimal', 'fashion', 'electronics', 'custom']
        }
      ])
      await installTheme(themesDir, themeName)
      break
    case 'switch':
      const { selectedTheme } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedTheme',
          message: 'Select theme to activate:',
          choices: themes
        }
      ])
      await switchTheme(selectedTheme)
      break
    case 'create':
      await createCustomTheme(themesDir)
      break
  }
}

async function getCurrentTheme(): Promise<string | null> {
  try {
    const envPath = path.join(process.cwd(), '.env.local')
    if (await fs.pathExists(envPath)) {
      const envContent = await fs.readFile(envPath, 'utf-8')
      const match = envContent.match(/STORECRAFT_ACTIVE_THEME=(.+)/)
      return match ? match[1].trim() : null
    }
  } catch (error) {
    // Ignore errors
  }
  return null
}

async function getThemeInfo(themePath: string) {
  try {
    const configPath = path.join(themePath, 'theme.json')
    if (await fs.pathExists(configPath)) {
      return await fs.readJson(configPath)
    }
  } catch (error) {
    // Ignore errors
  }
  return {}
}

async function updateActiveTheme(themeName: string) {
  const envPath = path.join(process.cwd(), '.env.local')
  
  if (await fs.pathExists(envPath)) {
    let envContent = await fs.readFile(envPath, 'utf-8')
    
    if (envContent.includes('STORECRAFT_ACTIVE_THEME=')) {
      envContent = envContent.replace(
        /STORECRAFT_ACTIVE_THEME=.+/,
        `STORECRAFT_ACTIVE_THEME=${themeName}`
      )
    } else {
      envContent += `\nSTORECRAFT_ACTIVE_THEME=${themeName}\n`
    }
    
    await fs.writeFile(envPath, envContent)
  }
}

async function createThemeFromTemplate(themePath: string, themeName: string) {
  await fs.ensureDir(themePath)

  // Create theme configuration
  const themeConfig = {
    name: themeName,
    version: '1.0.0',
    description: `${themeName} theme for StoreCraft`,
    author: 'StoreCraft CLI',
    components: {},
    styles: {
      colors: {
        primary: '#000000',
        secondary: '#666666',
        accent: '#0070f3'
      },
      typography: {
        fontFamily: 'system-ui, sans-serif',
        headingFont: 'inherit'
      }
    }
  }

  await fs.writeJson(path.join(themePath, 'theme.json'), themeConfig, { spaces: 2 })

  // Create components directory with basic overrides
  const componentsDir = path.join(themePath, 'components')
  await fs.ensureDir(componentsDir)

  // Create basic component override example
  const headerOverride = `
import { Header as BaseHeader } from 'storecraft-framework'

interface HeaderProps {
  // Add custom props here
}

export function Header(props: HeaderProps) {
  return (
    <BaseHeader 
      {...props}
      className="bg-white shadow-sm"
      // Add custom styling or behavior
    />
  )
}
`.trim()

  await fs.writeFile(path.join(componentsDir, 'Header.tsx'), headerOverride)

  // Create styles directory
  const stylesDir = path.join(themePath, 'styles')
  await fs.ensureDir(stylesDir)

  const themeStyles = `
/* ${themeName} Theme Styles */

:root {
  --primary-color: #000000;
  --secondary-color: #666666;
  --accent-color: #0070f3;
  --background-color: #ffffff;
  --text-color: #000000;
}

.storecraft-theme-${themeName} {
  color: var(--text-color);
  background-color: var(--background-color);
}

/* Component specific styles */
.storecraft-header {
  border-bottom: 1px solid #e5e5e5;
}

.storecraft-product-card {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  transition: box-shadow 0.2s ease;
}

.storecraft-product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
`.trim()

  await fs.writeFile(path.join(stylesDir, 'theme.css'), themeStyles)

  console.log(chalk.green(`Created theme structure in: ${themePath}`))
}

async function createCustomTheme(themesDir: string) {
  const { themeName, description } = await inquirer.prompt([
    {
      type: 'input',
      name: 'themeName',
      message: 'Theme name:',
      validate: (input: string) => {
        if (!input) return 'Theme name is required'
        if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
          return 'Theme name can only contain letters, numbers, hyphens, and underscores'
        }
        return true
      }
    },
    {
      type: 'input',
      name: 'description',
      message: 'Theme description (optional):',
    }
  ])

  const themePath = path.join(themesDir, themeName)
  
  if (await fs.pathExists(themePath)) {
    console.error(chalk.red(`Theme ${themeName} already exists`))
    return
  }

  await createThemeFromTemplate(themePath, themeName)
  
  if (description) {
    const configPath = path.join(themePath, 'theme.json')
    const config = await fs.readJson(configPath)
    config.description = description
    await fs.writeJson(configPath, config, { spaces: 2 })
  }
  
  console.log(chalk.green(`✓ Custom theme ${themeName} created successfully`))
  console.log(chalk.dim(`Switch to it with: myshop theme switch ${themeName}`))
}