/** @type {import('next').NextConfig} */
const { default: withStorecraft } = require('storecraft-framework/next-plugin');

// Import your store config
const storeConfig = require('./store.config');

const nextConfig = {
  // Your Next.js configuration options here
  reactStrictMode: true,
  swcMinify: true
};

module.exports = withStorecraft({
  // StoreCraft configuration options
  configPath: './store.config.js',
  themesPath: './themes',
  devMode: process.env.NODE_ENV === 'development'
})(nextConfig);
