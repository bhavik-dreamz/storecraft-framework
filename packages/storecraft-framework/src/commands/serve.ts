import { initializeTheme } from '../lib/theme';
import { setupShopifyClient } from '../lib/shopify';
import { loadStoreCraftConfig } from '../lib/config';

export async function serve() {
  try {
    // Load configuration
    const config = await loadStoreCraftConfig();
    
    // Initialize theme system
    await initializeTheme(config.activeTheme);
    
    // Setup Shopify client
    await setupShopifyClient(config.shopify);
    
    console.log('🎯 StoreCraft services initialized');
    
    // Keep process alive
    process.stdin.resume();
    
  } catch (error) {
    console.error('Failed to start StoreCraft services:', error);
    process.exit(1);
  }
}
