// Main Framework Exports

// Providers
export { RootProvider } from './providers/RootProvider';
export { CartProvider, useCart } from './providers/CartProvider';
export { AuthProvider, useAuth } from './providers/AuthProvider';
export { ThemeProvider, useTheme } from './providers/ThemeProvider';

// Core Routes
export { HomePage } from './routes/HomePage';
export { ProductPage } from './routes/ProductPage';
export { CollectionPage } from './routes/CollectionPage';

// Core Components
export { ProductGrid } from './components/ProductGrid';

// Shopify API
export { getShopifyClient } from './lib/shopify/client';
export { getShopifyAPI, shopifyApi } from './lib/shopify/api';
export { useProduct, useProducts, useCollection, useCollections, useCustomer } from './lib/shopify/hooks';

// Types
export * from './types/shopify';
export type {
  ThemeConfig,
  ThemeSettings,
  StorecraftConfig,
  ComponentOverride,
  ThemeContextValue,
  FrameworkContextValue,
  ThemeManifest
} from './types/theme';

// Configuration Types
export type {
  StoreConfigSchema,
  RuntimeConfig,
  StorecraftConfig as StorecraftPluginConfig,
  ExtendedNextConfig
} from './lib/config/types';

// Utilities
export { cn } from './utils/cn';
export { formatPrice, formatDate } from './utils/formatters';

// Theme System
export * from './lib/theme';

// Router System
export type { StorecraftRouter, RouteConfig, RouterConfig } from './lib/router';
export {
  createStorecraftRouter,
  routeUtils,
  useStorecraftRouter,
  defaultRoutes
} from './lib/router';

// Additional Components (for compatibility)
export {
  ProductCard,
  CollectionGrid,
  Cart as CartComponent,
  Header,
  Footer
} from './components';

// Additional Routes (for compatibility)
export { ProductDetailPage } from './routes/ProductDetailPage';
export { LoginPage } from './routes/LoginPage';
export { AccountPage } from './routes/AccountPage';
export { AdminDashboard } from './routes/AdminDashboard';
export { AdminOrderDetail } from './routes/AdminOrderDetail';
export { CartPage } from './routes/CartPage';

// Next.js Plugin
export { default as withStorecraft } from './next-plugin';
export { StoreCraftApp, withStoreCraft } from './lib/next/app-integration';

// Version
export const VERSION = '1.0.0';