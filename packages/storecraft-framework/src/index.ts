// Main Framework Exports

// Types
export * from './types/shopify'
export type {
  ThemeConfig,
  ThemeSettings,
  StorecraftConfig,
  ComponentOverride,
  ThemeContextValue,
  FrameworkContextValue
} from './types/theme'

// Providers  
export {
  RootProvider,
  CartProvider,
  AuthProvider,
  ThemeProvider as ThemeProviderComponent,
  useCart,
  useAuth,
  useTheme
} from './providers'

// Components
export {
  ProductCard,
  ProductGrid,
  CollectionGrid,
  Cart as CartComponent,
  Header,
  Footer
} from './components'

// Core Routes
export { HomePage } from './routes/HomePage'
export { ProductPage } from './routes/ProductPage'
export { CollectionPage } from './routes/CollectionPage'
export { ProductDetailPage } from './routes/ProductDetailPage'
export { LoginPage } from './routes/LoginPage'
export { AccountPage } from './routes/AccountPage'
export { AdminDashboard } from './routes/AdminDashboard'
export { AdminOrderDetail } from './routes/AdminOrderDetail'
export { CartPage } from './routes/CartPage'

// Theme System
export * from './lib/theme'

// Shopify Integration
export * from './lib/shopify'

// Utilities
export { cn } from './utils/cn'
export { formatPrice, formatDate } from './utils/formatters'

// Router System
export { 
  StorecraftRouter, 
  storecraftRouter, 
  routeUtils, 
  useStorecraftRouter,
  defaultRoutes
} from './lib/router'
export type { RouteConfig, RouterConfig } from './lib/router'

// Version
export const VERSION = '1.0.0'