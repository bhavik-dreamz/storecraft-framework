// Re-export all types
export * from './shopify'
export * from './theme'

// Import types for internal use
import type { Cart, Customer, Product, Collection } from './shopify'

// Store Configuration
export interface StoreConfig {
  activeTheme: string;
  shopify: {
    domain: string;
    storefrontAccessToken: string;
    adminAccessToken?: string;
  };
  features?: {
    admin?: boolean;
    auth?: boolean;
    analytics?: boolean;
  };
}

// Framework-specific types
export interface APIResponse<T> {
  data?: T
  errors?: Array<{
    message: string
    path?: string[]
    extensions?: Record<string, unknown>
  }>
}

export interface PaginationArgs {
  first?: number
  after?: string
  last?: number
  before?: string
}

export interface SortArgs {
  sortKey?: string
  reverse?: boolean
}

export interface FilterArgs {
  query?: string
  filters?: Record<string, unknown>
}

// Hook Types
export interface UseCartReturn {
  cart: Cart | null;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface UseAuthReturn {
  customer: Customer | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Page Props Types
export interface ProductPageProps {
  product: Product;
  recommendations: Product[];
}

export interface CollectionPageProps {
  collection: Collection;
  products: Product[];
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
}

export interface HomePageProps {
  featuredProducts: Product[];
  featuredCollections: Collection[];
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Override<T, U> = Omit<T, keyof U> & U