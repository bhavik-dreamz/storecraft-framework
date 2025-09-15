import { NextConfig } from 'next';
import path from 'path';
import fs from 'fs';
import { StoreConfigSchema, StorecraftConfig, ExtendedNextConfig } from './lib/config/types';
import { validateStoreConfig } from './lib/config/validator';
import { ThemeResolver } from './lib/theme/resolver';
import { generateThemeRewrites, generateThemeHeaders } from './lib/next/route-generator';
import { setupThemeWatcher, setupDevelopmentWebpack } from './lib/next/theme-watcher';
import { ThemeResolverPlugin } from './lib/next/theme-resolver-plugin';

export default function withStorecraft(
  storecraftConfig: StorecraftConfig = {}
) {
  return (nextConfig: NextConfig = {}): ExtendedNextConfig => {
    const {
      configPath = './store.config.js',
      themesPath = './themes',
      devMode = process.env.NODE_ENV === 'development'
    } = storecraftConfig;

    // Load store configuration
    const storeConfig = loadStoreConfig(configPath);
    const resolver = new ThemeResolver(
      path.resolve(themesPath),
      storeConfig.activeTheme,
      path.resolve('./node_modules/storecraft-framework')
    );

    return {
      ...nextConfig,
      
      // Store storecraft config for runtime access
      storecraft: storecraftConfig,
      
      // Extend webpack configuration
      webpack: (config, options) => {
        // Add theme resolution
        setupThemeWebpack(config, resolver, devMode);
        
        // Call original webpack config if exists
        if (typeof nextConfig.webpack === 'function') {
          config = nextConfig.webpack(config, options);
        }
        
        return config;
      },

      // Extend rewrites for theme routing
      async rewrites() {
        const themeRewrites = await generateThemeRewrites(resolver);
        const originalRewrites = await nextConfig.rewrites?.() || [];
        
        return {
          beforeFiles: [
            ...themeRewrites,
            ...(Array.isArray(originalRewrites) ? originalRewrites : originalRewrites.beforeFiles || [])
          ],
          afterFiles: Array.isArray(originalRewrites) ? [] : originalRewrites.afterFiles || [],
          fallback: Array.isArray(originalRewrites) ? [] : originalRewrites.fallback || []
        };
      },

      // Extend headers for theme assets
      async headers() {
        const themeHeaders = generateThemeHeaders();
        const originalHeaders = await nextConfig.headers?.() || [];
        
        return [
          ...themeHeaders,
          ...originalHeaders
        ];
      },

      // Setup development mode enhancements
      ...(devMode && {
        onDemandEntries: {
          maxInactiveAge: 60 * 1000, // 1 minute
          pagesBufferLength: 5,
        }
      }),

      // Environment variables for runtime
      env: {
        ...nextConfig.env,
        STORECRAFT_ACTIVE_THEME: storeConfig.activeTheme,
        STORECRAFT_THEMES_PATH: themesPath,
        STORECRAFT_CONFIG: JSON.stringify(storeConfig)
      }
    };
  };
}

/**
 * Load store configuration
 */
function loadStoreConfig(configPath: string): StoreConfigSchema {
  try {
    const fullPath = path.resolve(configPath);
    
    // Clear require cache in development
    if (process.env.NODE_ENV === 'development') {
      delete require.cache[fullPath];
    }
    
    const config = require(fullPath);
    const storeConfig = config.default || config;
    return validateStoreConfig(storeConfig);
  } catch (error) {
    console.error('Failed to load store config:', error);
    
    // Return default configuration
    return {
      activeTheme: 'default',
      shopify: {
        domain: process.env.SHOPIFY_DOMAIN || '',
        storefrontAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || ''
      }
    };
  }
}

/**
 * Configure webpack for theme support
 */
function setupThemeWebpack(config: any, resolver: ThemeResolver, devMode: boolean) {
  // Add theme path aliases
  const themePath = path.join(resolver.themesPath, resolver.activeTheme);
  
  config.resolve.alias = {
    ...config.resolve.alias,
    '@theme': themePath,
    '@theme-components': path.join(themePath, 'components'),
    '@theme-pages': path.join(themePath, 'pages'),
    '@theme-styles': path.join(themePath, 'styles'),
    '@framework': resolver.frameworkPath
  };

  // Add theme file extensions
  config.resolve.extensions = [
    '.theme.tsx',
    '.theme.ts',
    '.theme.jsx',
    '.theme.js',
    ...config.resolve.extensions
  ];

  // Theme module resolution
  config.plugins.push(new ThemeResolverPlugin(resolver));

  // Development mode enhancements
  if (devMode) {
    setupDevelopmentWebpack(config, resolver);
  }
}