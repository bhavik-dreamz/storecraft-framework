/** @type {import('next').NextConfig} */
let withStorecraft;
try {
  // Use the official export subpath from storecraft-framework
  const plugin = require('storecraft-framework/next-plugin');
  withStorecraft = plugin && plugin.default ? plugin.default : plugin;
} catch (e) {
  console.warn('[storecraft] Plugin not available, continuing without theme rewrites:', e?.message || e);
}

const baseConfig = {
  reactStrictMode: true,
};

module.exports = withStorecraft
  ? withStorecraft({ themesPath: './themes' })(baseConfig)
  : baseConfig;
