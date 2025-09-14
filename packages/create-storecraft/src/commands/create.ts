import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'

interface CreateOptions {
  template?: string
  yes?: boolean
  theme?: string
}

function validatePackageName(name: string): boolean {
  // Basic validation for package names
  if (!name || name.length === 0) return false
  if (name.startsWith('.') || name.startsWith('_')) return false
  if (name !== name.toLowerCase()) return false
  if (!/^[a-z0-9-_]+$/.test(name)) return false
  if (name.length > 214) return false
  return true
}

export async function createProject(projectName: string | undefined, options: CreateOptions) {
  try {
    // Get project name if not provided
    if (!projectName) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your project name?',
          default: 'my-storecraft-shop',
          validate: (input: string) => {
            if (!validatePackageName(input)) {
              return 'Please enter a valid package name (lowercase letters, numbers, hyphens, and underscores only)'
            }
            return true
          }
        }
      ])
      projectName = answers.projectName
    }

    if (!projectName) {
      console.error(chalk.red('Project name is required'))
      process.exit(1)
    }

    const targetDir = path.resolve(process.cwd(), projectName)
    
    // Check if directory exists
    if (await fs.pathExists(targetDir)) {
      if (!options.yes) {
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: `Directory ${projectName} already exists. Overwrite?`,
            default: false
          }
        ])
        
        if (!overwrite) {
          console.log(chalk.yellow('Operation cancelled'))
          return
        }
      }
      
      await fs.emptyDir(targetDir)
    } else {
      await fs.ensureDir(targetDir)
    }

    // Get project configuration
    let config: any = {}
    
    if (!options.yes) {
      config = await inquirer.prompt([
        {
          type: 'input',
          name: 'shopifyDomain',
          message: 'Shopify store domain (e.g., your-store.myshopify.com):',
          validate: (input: string) => {
            if (!input) return 'Shopify domain is required'
            if (!input.includes('.myshopify.com')) {
              return 'Please enter a valid Shopify domain'
            }
            return true
          }
        },
        {
          type: 'password',
          name: 'storefrontToken',
          message: 'Shopify Storefront Access Token:',
          validate: (input: string) => {
            if (!input) return 'Storefront Access Token is required'
            return true
          }
        },
        {
          type: 'list',
          name: 'theme',
          message: 'Choose initial theme:',
          choices: ['default', 'modern', 'minimal'],
          default: options.theme || 'default'
        },
        {
          type: 'checkbox',
          name: 'features',
          message: 'Select features to enable:',
          choices: [
            { name: 'Shopping Cart', value: 'cart', checked: true },
            { name: 'User Authentication', value: 'auth', checked: true },
            { name: 'Product Search', value: 'search', checked: true },
            { name: 'Wishlist', value: 'wishlist', checked: false },
            { name: 'Product Reviews', value: 'reviews', checked: false },
            { name: 'Blog', value: 'blog', checked: false },
            { name: 'Analytics', value: 'analytics', checked: false }
          ]
        }
      ])
    } else {
      // Use defaults for --yes flag
      config = {
        shopifyDomain: 'your-store.myshopify.com',
        storefrontToken: 'your-storefront-token',
        theme: options.theme || 'default',
        features: ['cart', 'auth', 'search']
      }
    }

    const spinner = ora('Creating StoreCraft project...').start()

    // Create project structure
    await createProjectStructure(targetDir, projectName, config, options.template || 'default')
    
    spinner.succeed('Project created successfully!')

    // Display next steps
    console.log('\n' + chalk.green('✨ Project created successfully!'))
    console.log('\n' + chalk.bold('Next steps:'))
    console.log(`  ${chalk.cyan('cd')} ${projectName}`)
    console.log(`  ${chalk.cyan('npm install')}`)
    
    if (!options.yes) {
      console.log(`  Update ${chalk.yellow('.env.local')} with your Shopify credentials`)
    }
    
    console.log(`  ${chalk.cyan('npm run dev')}`)
    console.log('\n' + chalk.dim('Happy building! 🚀'))

  } catch (error) {
    console.error(chalk.red('Error creating project:'), error)
    process.exit(1)
  }
}

async function createProjectStructure(
  targetDir: string,
  projectName: string,
  config: any,
  template: string
) {
  // Create package.json
  const packageJson = {
    name: projectName,
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
      'type-check': 'tsc --noEmit'
    },
    dependencies: {
      'next': '^14.0.0',
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'storecraft-framework': '^1.0.0',
      'typescript': '^5.3.0'
    },
    devDependencies: {
      '@types/node': '^20.10.0',
      '@types/react': '^18.2.45',
      '@types/react-dom': '^18.2.18',
      'eslint': '^8.54.0',
      'eslint-config-next': '^14.0.0'
    }
  }

  await fs.writeJson(path.join(targetDir, 'package.json'), packageJson, { spaces: 2 })

  // Create TypeScript config
  const tsConfig = {
    compilerOptions: {
      target: 'es5',
      lib: ['dom', 'dom.iterable', 'es6'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      plugins: [{ name: 'next' }],
      baseUrl: '.',
      paths: {
        '@/*': ['./src/*'],
        '@/components/*': ['./src/components/*'],
        '@/lib/*': ['./src/lib/*'],
        '@/styles/*': ['./src/styles/*']
      }
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules']
  }

  await fs.writeJson(path.join(targetDir, 'tsconfig.json'), tsConfig, { spaces: 2 })

  // Create Next.js config
  const nextConfig = `
import { withStoreCraft, createStoreCraftConfig } from 'storecraft-framework/next-plugin'

const storeCraftConfig = createStoreCraftConfig({
  activeTheme: '${config.theme}',
  shopify: {
    domain: process.env.SHOPIFY_DOMAIN || '${config.shopifyDomain}',
    storefrontAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '${config.storefrontToken}',
  },
  features: {
    ${config.features?.map((f: string) => `${f}: true`).join(',\n    ') || 'cart: true, auth: true, search: true'}
  }
})

export default withStoreCraft({
  experimental: {
    appDir: true,
  },
}, { config: storeCraftConfig })
`

  await fs.writeFile(path.join(targetDir, 'next.config.js'), nextConfig)

  // Create environment file
  const envContent = `
# Shopify Configuration
SHOPIFY_DOMAIN=${config.shopifyDomain}
SHOPIFY_STOREFRONT_ACCESS_TOKEN=${config.storefrontToken}

# StoreCraft Configuration  
STORECRAFT_ACTIVE_THEME=${config.theme}
STORECRAFT_THEMES_DIR=./themes

# Optional: Shopify Admin API (for advanced features)
# SHOPIFY_ADMIN_ACCESS_TOKEN=your-admin-token

# Optional: Analytics
# NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
`.trim()

  await fs.writeFile(path.join(targetDir, '.env.local'), envContent)

  // Create basic app structure
  await fs.ensureDir(path.join(targetDir, 'src/app'))
  await fs.ensureDir(path.join(targetDir, 'src/components'))
  await fs.ensureDir(path.join(targetDir, 'src/lib'))
  await fs.ensureDir(path.join(targetDir, 'themes', config.theme))

  // Create app layout
  const layoutContent = `
import { RootProvider, createStoreCraftConfig } from 'storecraft-framework'
import './globals.css'

const config = createStoreCraftConfig({
  activeTheme: process.env.STORECRAFT_ACTIVE_THEME || '${config.theme}',
  shopify: {
    domain: process.env.SHOPIFY_DOMAIN!,
    storefrontAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
  },
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <RootProvider config={config}>
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
`.trim()

  await fs.writeFile(path.join(targetDir, 'src/app/layout.tsx'), layoutContent)

  // Create home page
  const pageContent = `
import { Header, Footer, ProductCard } from 'storecraft-framework'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Welcome to Your Store
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Built with StoreCraft Framework - Modern, fast, and customizable.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <a
                href="/collections/all"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 md:py-4 md:text-lg md:px-10"
              >
                Shop Now
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
`.trim()

  await fs.writeFile(path.join(targetDir, 'src/app/page.tsx'), pageContent)

  // Create global styles
  const stylesContent = `
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

/* StoreCraft theme custom properties */
.storecraft-app {
  font-family: var(--font-family, system-ui, sans-serif);
}
`.trim()

  await fs.writeFile(path.join(targetDir, 'src/app/globals.css'), stylesContent)

  // Create README
  const readmeContent = `
# ${projectName}

A modern e-commerce store built with [StoreCraft Framework](https://storecraft-framework.com) and Next.js.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Update your Shopify credentials in \`.env.local\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) to view your store.

## Project Structure

- \`src/app/\` - Next.js app router pages
- \`src/components/\` - Custom React components
- \`themes/\` - StoreCraft themes
- \`.env.local\` - Environment configuration

## Available Commands

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`myshop theme list\` - List available themes
- \`myshop theme switch <theme>\` - Switch themes

## Learn More

- [StoreCraft Documentation](https://storecraft-framework.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Shopify Storefront API](https://shopify.dev/docs/storefront-api)
`.trim()

  await fs.writeFile(path.join(targetDir, 'README.md'), readmeContent)

  // Create .gitignore
  const gitignoreContent = `
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# StoreCraft
.storecraft/
`.trim()

  await fs.writeFile(path.join(targetDir, '.gitignore'), gitignoreContent)
}