// Core Shopify Types
export interface Money {
  amount: string
  currencyCode: string
}

export interface Image {
  id: string
  url: string
  altText?: string
  width?: number
  height?: number
}

export interface ProductVariant {
  id: string
  title: string
  price: Money
  compareAtPrice?: Money
  sku?: string
  barcode?: string
  availableForSale: boolean
  selectedOptions: Array<{
    name: string
    value: string
  }>
  image?: Image
  weight?: number
  weightUnit?: string
  requiresShipping: boolean
  taxable: boolean
}

export interface ProductOption {
  id: string
  name: string
  values: string[]
}

export interface Product {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  vendor: string
  productType: string
  tags: string[]
  createdAt: string
  updatedAt: string
  publishedAt: string
  availableForSale: boolean
  totalInventory?: number
  seo: {
    title?: string
    description?: string
  }
  images: Image[]
  variants: ProductVariant[]
  options: ProductOption[]
  priceRange: {
    minVariantPrice: Money
    maxVariantPrice: Money
  }
  compareAtPriceRange: {
    minVariantPrice: Money
    maxVariantPrice: Money
  }
}

export interface Collection {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  image?: Image
  updatedAt: string
  seo: {
    title?: string
    description?: string
  }
}

export interface CartLine {
  id: string
  quantity: number
  merchandise: ProductVariant & {
    product: {
      handle: string
      title: string
    }
  }
  cost: {
    totalAmount: Money
    amountPerQuantity: Money
    compareAtAmountPerQuantity?: Money
  }
  attributes: Array<{
    key: string
    value: string
  }>
}

export interface Cart {
  id: string
  checkoutUrl: string
  totalQuantity: number
  lines: CartLine[]
  cost: {
    totalAmount: Money
    subtotalAmount: Money
    totalTaxAmount?: Money
    totalDutyAmount?: Money
  }
  buyerIdentity?: {
    email?: string
    phone?: string
    customer?: Customer
    countryCode?: string
  }
  attributes: Array<{
    key: string
    value: string
  }>
  discountCodes: Array<{
    code: string
    applicable: boolean
  }>
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  firstName?: string
  lastName?: string
  displayName: string
  email?: string
  phone?: string
  tags: string[]
  createdAt: string
  updatedAt: string
  acceptsMarketing: boolean
  defaultAddress?: Address
  addresses: Address[]
  numberOfOrders: string
}

export interface Address {
  id?: string
  firstName?: string
  lastName?: string
  company?: string
  address1?: string
  address2?: string
  city?: string
  province?: string
  country?: string
  zip?: string
  phone?: string
}

export interface Order {
  id: string
  name: string
  orderNumber: number
  email?: string
  phone?: string
  processedAt: string
  financialStatus: string
  fulfillmentStatus: string
  statusUrl: string
  totalPrice: Money
  subtotalPrice?: Money
  totalTax?: Money
  totalShippingPrice?: Money
  currencyCode: string
  customer?: Customer
  shippingAddress?: Address
  billingAddress?: Address
  lineItems: Array<{
    title: string
    quantity: number
    price: Money
    product: {
      id: string
      handle: string
    }
    variant?: {
      id: string
      title: string
    }
  }>
}

// Pagination Types
export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor?: string
  endCursor?: string
}

export interface Connection<T> {
  edges: Array<{
    node: T
    cursor: string
  }>
  pageInfo: PageInfo
}

// API Response Types
export interface ProductsResponse {
  products: Product[]
  pageInfo: PageInfo
}

export interface CollectionsResponse {
  collections: Collection[]
  pageInfo: PageInfo
}

// Search and Filter Types
export interface ProductFilters {
  available?: boolean
  price?: {
    min?: number
    max?: number
  }
  vendor?: string[]
  productType?: string[]
  tags?: string[]
  variantOption?: {
    name: string
    value: string
  }
}

export interface ProductSortKeys {
  BEST_SELLING: 'BEST_SELLING'
  CREATED_AT: 'CREATED_AT' 
  ID: 'ID'
  PRICE: 'PRICE'
  PRODUCT_TYPE: 'PRODUCT_TYPE'
  RELEVANCE: 'RELEVANCE'
  TITLE: 'TITLE'
  UPDATED_AT: 'UPDATED_AT'
  VENDOR: 'VENDOR'
}

export type ProductSortKey = keyof ProductSortKeys

export interface CollectionSortKeys {
  ID: 'ID'
  RELEVANCE: 'RELEVANCE'
  TITLE: 'TITLE'
  UPDATED_AT: 'UPDATED_AT'
}

export type CollectionSortKey = keyof CollectionSortKeys

// Cart Input Types
export interface CartLineInput {
  merchandiseId: string
  quantity: number
  attributes?: Array<{
    key: string
    value: string
  }>
}

export interface CartLineUpdateInput {
  id: string
  quantity: number
  attributes?: Array<{
    key: string
    value: string
  }>
}

export interface BuyerIdentityInput {
  email?: string
  phone?: string
  countryCode?: string
}

// Customer Auth Types
export interface CustomerAccessToken {
  accessToken: string
  expiresAt: string
}

export interface CustomerLoginResult {
  accessToken: string
  expiresAt: string
  customer: Customer
}

export interface CustomerCreateInput {
  email: string
  password: string
  firstName?: string
  lastName?: string
  acceptsMarketing?: boolean
}

// Error Types
export interface UserError {
  field?: string[]
  message: string
}

export interface ShopifyError {
  message: string
  locations?: Array<{
    line: number
    column: number
  }>
  path?: string[]
  extensions?: Record<string, unknown>
}