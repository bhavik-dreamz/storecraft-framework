/**
 * StoreCraft Framework Next.js Configuration
 * 
 * This configuration is internal to the framework.
 * End users should not need to modify this file.
 */

const { resolveTheme } = require('./scripts/resolve-theme');

// Set internal mode flag
process.env.NEXT_CONFIG_INTERNAL = 'true';

// Resolve theme before Next.js boots
const rootDir = process.cwd();
console.log('📦 StoreCraft Framework - Internal Next.js Config');
console.log('🔍 Resolving theme from:', rootDir);

try {
  // Run theme resolver
  const config = resolveTheme(rootDir);
  
  // Make config available to the client
  const publicRuntimeConfig = {
    storecraft: config
  };

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    // Pass the resolved config to the client
    publicRuntimeConfig,
    // Allow theme files to be imported from outside the src directory
    transpilePackages: ['storecraft-framework'],
    // Inject storecraft config into the page
    webpack: (config, { isServer }) => {
      if (!isServer) {
        // Make the StoreCraft config available to the client
        config.plugins.push(
          new config.webpack.DefinePlugin({
            '__STORECRAFT_CONFIG__': JSON.stringify(config)
          })
        );
      }
      return config;
    },
  };

  module.exports = nextConfig;
} catch (error) {
  console.error('❌ Error in StoreCraft next.config.js:', error);
  
  // Fallback config
  module.exports = {
    reactStrictMode: true
  };
}
