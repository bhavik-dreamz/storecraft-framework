import path from 'path'
import { NextConfig } from 'next'
import { StorecraftConfig } from './types/theme'
import { createThemeResolver, getDefaultThemeContext } from './lib/theme/resolver'
import { 
  generateThemeRewrites, 
  generateThemeHeaders,
  isThemeRoute,
  resolveThemeRoute
} from './lib/next/route-generator'
import { 
  createDevThemeWatcher,
  ThemeWatcher
} from './lib/next/theme-watcher'

interface WithStoreCraftOptions {
  config: StorecraftConfig
}

// Global theme watcher instance
let globalThemeWatcher: ThemeWatcher | null = null

export function withStoreCraft(nextConfig: NextConfig = {}, options: WithStoreCraftOptions): NextConfig {
  const { config } = options
  const isDev = process.env.NODE_ENV === 'development'

  // Create enhanced theme resolver
  const themeResolver = createThemeResolver({
    activeTheme: config.activeTheme,
    availableThemes: [config.activeTheme], // TODO: Add support for multiple themes
    themeDirectory: config.themesDirectory || './themes',
    cacheEnabled: !isDev
  })

  // Setup development watcher
  if (isDev && !globalThemeWatcher) {
    globalThemeWatcher = createDevThemeWatcher(
      themeResolver,
      () => {
        console.log('🔄 Theme changes detected, triggering reload...')
        // In a real implementation, we would trigger hot reload
      }
    )

    // Start watcher
    globalThemeWatcher.start().catch(error => {
      console.error('Failed to start theme watcher:', error)
    })

    // Cleanup on process exit
    process.on('SIGINT', () => {
      globalThemeWatcher?.stop()
      process.exit()
    })
  }

  return {
    ...nextConfig,
    webpack: (webpackConfig: any, context: any) => {
      // Call the original webpack function if it exists
      if (nextConfig.webpack) {
        webpackConfig = nextConfig.webpack(webpackConfig, context)
      }

      // Add theme resolution
      addThemeResolution(webpackConfig, config, themeResolver)

      // Add environment variables
      addEnvironmentVariables(webpackConfig, config)

      // Development enhancements
      if (context.dev) {
        addDevelopmentEnhancements(webpackConfig, config)
      }

      return webpackConfig
    },

    // Add rewrites for theme routing
    async rewrites() {
      try {
        const themeRewrites = await generateThemeRewrites(themeResolver)
        const existingRewrites = typeof nextConfig.rewrites === 'function' 
          ? await nextConfig.rewrites()
          : nextConfig.rewrites || []

        return [
          ...themeRewrites,
          ...(Array.isArray(existingRewrites) ? existingRewrites : existingRewrites.beforeFiles || [])
        ]
      } catch (error) {
        console.error('Failed to generate theme rewrites:', error)
        return typeof nextConfig.rewrites === 'function' 
          ? await nextConfig.rewrites()
          : nextConfig.rewrites || []
      }
    },

    // Add headers for theme assets
    async headers() {
      try {
        const themeHeaders = generateThemeHeaders()
        const existingHeaders = typeof nextConfig.headers === 'function'
          ? await nextConfig.headers()
          : nextConfig.headers || []

        return [
          ...themeHeaders,
          ...existingHeaders
        ]
      } catch (error) {
        console.error('Failed to generate theme headers:', error)
        return typeof nextConfig.headers === 'function'
          ? await nextConfig.headers()
          : nextConfig.headers || []
      }
    },
    
    // Add custom page extensions for theme overrides
    pageExtensions: [
      ...(nextConfig.pageExtensions || ['tsx', 'ts', 'jsx', 'js']),
    ],

    // Configure environment variables
    env: {
      ...nextConfig.env,
      STORECRAFT_ACTIVE_THEME: config.activeTheme,
      STORECRAFT_THEMES_DIR: config.themesDirectory || './themes',
      SHOPIFY_DOMAIN: config.shopify.domain,
      SHOPIFY_STOREFRONT_ACCESS_TOKEN: config.shopify.storefrontAccessToken,
    },

    // Add experimental features if needed
    experimental: {
      ...nextConfig.experimental,
      serverComponentsExternalPackages: [
        ...(nextConfig.experimental?.serverComponentsExternalPackages || []),
        'storecraft-framework'
      ]
    }
  }
}

function addThemeResolution(webpackConfig: any, config: StorecraftConfig, resolver: any) {
  const themesDir = path.resolve(process.cwd(), config.themesDirectory || './themes')
  const activeThemeDir = path.join(themesDir, config.activeTheme)

  // Add alias for theme components
  webpackConfig.resolve = webpackConfig.resolve || {}
  webpackConfig.resolve.alias = {
    ...webpackConfig.resolve.alias,
    '@theme': activeThemeDir,
    '@themes': themesDir,
    '@storecraft/theme': activeThemeDir,
    '@storecraft/themes': themesDir,
    '@storecraft/framework': path.resolve(__dirname)
  }

  // Add theme directories to module resolution
  webpackConfig.resolve.modules = [
    ...(webpackConfig.resolve.modules || []),
    activeThemeDir,
    themesDir,
    'node_modules'
  ]

  // Add theme file extensions
  webpackConfig.resolve.extensions = [
    ...webpackConfig.resolve.extensions || [],
    '.theme.tsx',
    '.theme.ts',
    '.theme.jsx',
    '.theme.js'
  ]

  // Enhanced theme resolver plugin
  webpackConfig.resolve.plugins = [
    ...(webpackConfig.resolve.plugins || []),
    new EnhancedThemeResolverPlugin(config, resolver)
  ]
}

function addEnvironmentVariables(webpackConfig: any, config: StorecraftConfig) {
  const { DefinePlugin } = require('webpack')

  webpackConfig.plugins = webpackConfig.plugins || []
  webpackConfig.plugins.push(
    new DefinePlugin({
      'process.env.STORECRAFT_CONFIG': JSON.stringify(config),
      'process.env.STORECRAFT_VERSION': JSON.stringify('1.0.0'),
    })
  )
}

function addDevelopmentEnhancements(webpackConfig: any, config: StorecraftConfig) {
  // Add hot module replacement for theme files
  const themesDir = path.resolve(process.cwd(), config.themesDirectory || './themes')
  
  // Watch theme directories for changes
  webpackConfig.watchOptions = {
    ...webpackConfig.watchOptions,
    ignored: [
      /node_modules/,
      '!node_modules/storecraft-framework'
    ]
  }

  // Add theme files to watched entries
  if (webpackConfig.entry && typeof webpackConfig.entry === 'object') {
    // This would add theme files to webpack's watch list
  }
}

class EnhancedThemeResolverPlugin {
  private config: StorecraftConfig
  private themeResolver: any

  constructor(config: StorecraftConfig, themeResolver: any) {
    this.config = config
    this.themeResolver = themeResolver
  }

  apply(resolver: any) {
    const target = resolver.ensureHook('resolve')
    
    resolver.getHook('before-resolve').tapAsync(
      'EnhancedThemeResolverPlugin',
      async (request: any, resolveContext: any, callback: any) => {
        // Enhanced theme resolution logic
        await this.resolveThemeRequest(request, resolveContext, callback)
      }
    )
  }

  private async resolveThemeRequest(request: any, resolveContext: any, callback: any) {
    const { request: requestPath } = request

    try {
      // Check if this is a theme route that should be handled
      if (isThemeRoute(requestPath)) {
        const resolvedPath = await resolveThemeRoute(requestPath, this.themeResolver)
        
        if (resolvedPath) {
          request.request = resolvedPath
        }
      }
      // Check if this is a component or page request that could be themed
      else if (this.isThemeableRequest(requestPath)) {
        const themePath = this.resolveThemePath(requestPath)
        
        if (themePath) {
          // Modify the request to point to the theme file
          request.request = themePath
        }
      }

      callback()
    } catch (error) {
      console.error('Enhanced theme resolution error:', error)
      callback()
    }
  }

  private isThemeableRequest(requestPath: string): boolean {
    // Check if the request is for a component or page that can be themed
    return (
      requestPath.includes('components/') ||
      requestPath.includes('pages/') ||
      requestPath.includes('layouts/') ||
      requestPath.startsWith('@storecraft/theme') ||
      requestPath.startsWith('@theme/')
    )
  }

  private resolveThemePath(requestPath: string): string | null {
    const themesDir = path.resolve(process.cwd(), this.config.themesDirectory || './themes')
    const activeThemeDir = path.join(themesDir, this.config.activeTheme)
    
    // Handle @storecraft/theme alias
    if (requestPath.startsWith('@storecraft/theme/')) {
      const relativePath = requestPath.replace('@storecraft/theme/', '')
      return path.join(activeThemeDir, relativePath)
    }

    // Handle @theme alias
    if (requestPath.startsWith('@theme/')) {
      const relativePath = requestPath.replace('@theme/', '')
      return path.join(activeThemeDir, relativePath)
    }

    // Extract the relative path after 'components/', 'pages/', etc.
    const match = requestPath.match(/(components|pages|layouts)\/(.+)/)
    if (match) {
      const [, type, relativePath] = match
      const themeFilePath = path.join(activeThemeDir, type, relativePath)
      
      // Check if the theme file exists (in a real implementation)
      // For now, just return the potential path
      return themeFilePath
    }

    return null
  }
}

// Export for direct use
export default withStoreCraft

// Additional utilities
export function createStorecraftConfig(config: Partial<StorecraftConfig>): StorecraftConfig {
  return {
    activeTheme: 'default',
    themesDirectory: './themes',
    shopify: {
      domain: '',
      storefrontAccessToken: '',
      ...config.shopify
    },
    features: {
      cart: true,
      auth: true,
      search: true,
      wishlist: true,
      reviews: false,
      blog: false,
      analytics: false,
      ...config.features
    },
    seo: {
      titleTemplate: '%s | StoreCraft',
      defaultTitle: 'StoreCraft Store',
      defaultDescription: 'Modern e-commerce powered by StoreCraft',
      ...config.seo
    },
    performance: {
      imageOptimization: true,
      lazyLoading: true,
      prefetching: true,
      bundleAnalyzer: false,
      ...config.performance
    },
    ...config
  }
}

export function validateStorecraftConfig(config: StorecraftConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.shopify?.domain) {
    errors.push('shopify.domain is required')
  }

  if (!config.shopify?.storefrontAccessToken) {
    errors.push('shopify.storefrontAccessToken is required')
  }

  if (!config.activeTheme) {
    errors.push('activeTheme is required')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
