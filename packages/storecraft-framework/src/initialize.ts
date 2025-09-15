import { getShopifyClient } from './lib/shopify'
import type { StoreConfigSchema } from './lib/config/types'

// Simplified development configuration
const getDefaultConfig = (): StoreConfigSchema => ({
  // Prefer explicit StoreCraft env, then legacy alias
  activeTheme:
    process.env.STORECRAFT_ACTIVE_THEME ||
    process.env.STORECRAFT_THEME ||
    'default',
  shopify: {
    // Support both simple and NEXT_PUBLIC-prefixed variables
    domain:
      process.env.SHOPIFY_DOMAIN ||
      process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
      process.env.SHOPIFY_STORE_DOMAIN ||
      '',
    storefrontAccessToken:
      process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
      process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ||
      process.env.SHOPIFY_STOREFRONT_TOKEN ||
      '',
    adminAccessToken:
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ||
      process.env.SHOPIFY_ADMIN_TOKEN
  }
})

interface InitializeOptions {
  port?: number
  host?: string
}

export interface StoreCraftInstance {
  port: number
  host: string
  config: StoreConfigSchema
  client: ReturnType<typeof getShopifyClient>
  ready: boolean
}

export async function initializeStoreCraft(options: InitializeOptions = {}): Promise<StoreCraftInstance> {
  try {
    const { port = 3000, host = 'localhost' } = options;
    const config = getDefaultConfig();
    
    console.log('Initializing StoreCraft with config:', JSON.stringify(config, null, 2));

    // Validate required configuration
    if (!config.shopify.domain || !config.shopify.storefrontAccessToken) {
      const error = new Error('Missing required Shopify configuration. Please check your environment variables.');
      console.error('Failed to initialize StoreCraft:', error);
      throw error;
    }

    // Initialize Shopify client
    const client = getShopifyClient(config);
    
    // Create StoreCraft instance
    const instance: StoreCraftInstance = {
      port,
      host,
      config,
      client,
      ready: true
    };

    console.log(`StoreCraft initialized successfully on ${host}:${port}`);
    return instance;
    
  } catch (error) {
    console.error('Failed to initialize StoreCraft:', error);
    throw error;
  }
}