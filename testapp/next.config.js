/** @type {import('next').NextConfig} */
const { default: withStorecraft } = require('../packages/storecraft-framework/dist/next-plugin');

// Import store config
const storeConfig = require('./store.config');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true
};

module.exports = withStorecraft({
  configPath: './store.config.js',
  themesPath: './themes',
  devMode: process.env.NODE_ENV === 'development',
  // Pass the store config directly to ensure it's loaded correctly
  storeConfig
})(nextConfig);
