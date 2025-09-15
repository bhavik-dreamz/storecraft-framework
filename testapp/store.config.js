// StoreCraft Configuration
module.exports = {
  activeTheme: process.env.STORECRAFT_ACTIVE_THEME || 'default',
  shopify: {
    domain: process.env.SHOPIFY_DOMAIN || 'findash-shipping-1.myshopify.com',
    storefrontAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || 'c075ebdb18e0499266667173ffead00f',
    adminAccessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '',
  }
}