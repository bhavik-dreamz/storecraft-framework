# Chapter 1: Architecture & Project Setup

## 🎯 Learning Goals
- Understand the framework architecture
- Set up the development environment
- Design the project structure
- Create the foundation packages

## 📐 Framework Architecture

### Core Concepts

Our StoreCraft Framework follows a **layered architecture** similar to WordPress:

```
┌─────────────────────────────────────┐
│           User Project              │
├─────────────────────────────────────┤
│  Themes (Overrides & Extensions)    │
├─────────────────────────────────────┤
│      StoreCraft Framework          │
│  (Core Routes, Providers, Admin)    │
├─────────────────────────────────────┤
│         Next.js Runtime            │
└─────────────────────────────────────┘
```

### Key Components

1. **Framework Core** (`storecraft-framework`)
   - Base routes and components
   - React providers (Cart, Auth, Theme)
   - Shopify API integration
   - Admin dashboard

2. **Theme System**
   - Route override mechanism
   - Component inheritance
   - Style customization

3. **CLI Tool** (`create-myshop`)
   - Project scaffolding
   - Theme management
   - Development commands

4. **Next.js Plugin** (`withStorecraft`)
   - Route merging
   - Theme loading
   - Build-time optimizations

## 🛠 Development Environment Setup

### Prerequisites

Ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- TypeScript knowledge
- Basic React/Next.js experience

### Project Structure Overview

We'll create three main packages:

```
storecraft-ecosystem/
├── packages/
│   ├── storecraft-framework/    # Main framework
│   ├── create-myshop/          # CLI tool
│   └── example-themes/         # Theme templates
├── examples/
│   └── demo-store/            # Example implementation
└── docs/                      # Documentation
```

## 🏗 Setting Up the Framework Core

### Step 1: Initialize the Framework Package

Let's start by setting up our main framework package:

```bash
mkdir storecraft-framework
cd storecraft-framework
npm init -y
```

### Step 2: Configure package.json

```json
{
  "name": "storecraft-framework",
  "version": "1.0.0",
  "description": "A theme-based framework for Shopify headless stores",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./next-plugin": "./dist/next-plugin.js",
    "./types": "./dist/types/index.d.ts"
  },
  "files": [
    "dist",
    "templates"
  ],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "type-check": "tsc --noEmit"
  },
  "peerDependencies": {
    "next": ">=13.0.0",
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "dependencies": {
    "graphql-request": "^7.0.0",
    "zustand": "^4.4.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "class-variance-authority": "^0.7.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "rollup": "^4.0.0",
    "@rollup/plugin-typescript": "^11.0.0"
  }
}
```

### Step 3: TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es2020",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 4: Build Configuration

Create `rollup.config.js`:

```javascript
import typescript from '@rollup/plugin-typescript';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        exports: 'named'
      },
      {
        file: 'dist/index.esm.js',
        format: 'es'
      }
    ],
    external: [
      ...Object.keys(pkg.peerDependencies || {}),
      ...Object.keys(pkg.dependencies || {})
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        outDir: 'dist'
      })
    ]
  },
  {
    input: 'src/next-plugin.ts',
    output: {
      file: 'dist/next-plugin.js',
      format: 'cjs',
      exports: 'default'
    },
    external: [
      ...Object.keys(pkg.peerDependencies || {}),
      'fs',
      'path'
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json'
      })
    ]
  }
];
```

## 📋 Core Types Definition

Create `src/types/index.ts`:

```typescript
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

// Theme Configuration
export interface ThemeConfig {
  name: string;
  version: string;
  author: string;
  description: string;
  pages?: string[];
  components?: string[];
  layouts?: string[];
}

// Product Types
export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  images: ProductImage[];
  variants: ProductVariant[];
  price: Money;
  compareAtPrice?: Money;
  tags: string[];
  vendor: string;
  productType: string;
  availableForSale: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: Money;
  compareAtPrice?: Money;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  image?: ProductImage;
  weight?: number;
  weightUnit?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  width: number;
  height: number;
}

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface SelectedOption {
  name: string;
  value: string;
}

// Cart Types
export interface Cart {
  id: string;
  lines: CartLine[];
  cost: {
    totalAmount: Money;
    subtotalAmount: Money;
    totalTaxAmount?: Money;
  };
  checkoutUrl: string;
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    selectedOptions: SelectedOption[];
    product: Product;
  };
  cost: {
    totalAmount: Money;
    amountPerQuantity: Money;
    compareAtAmountPerQuantity?: Money;
  };
}

// Collection Types
export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image?: ProductImage;
  products: {
    edges: Array<{
      node: Product;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

// Customer Types
export interface Customer {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  addresses: CustomerAddress[];
  orders: {
    edges: Array<{
      node: Order;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAddress {
  id: string;
  firstName?: string;
  lastName?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
  company?: string;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: number;
  email: string;
  phone?: string;
  totalPrice: Money;
  subtotalPrice: Money;
  totalTax: Money;
  totalShippingPrice: Money;
  lineItems: OrderLineItem[];
  shippingAddress?: CustomerAddress;
  billingAddress?: CustomerAddress;
  fulfillmentStatus: string;
  financialStatus: string;
  processedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderLineItem {
  id: string;
  title: string;
  quantity: number;
  variant?: ProductVariant;
  originalTotalPrice: Money;
  discountedTotalPrice: Money;
}

// API Response Types
export interface ShopifyResponse<T> {
  data: T;
  extensions?: {
    cost: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
}

export interface ShopifyError {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: string[];
  extensions?: Record<string, any>;
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
```

## 🎉 Chapter 1 Summary

In this chapter, we've:
1. ✅ Designed the framework architecture
2. ✅ Set up the development environment
3. ✅ Created the project structure foundation
4. ✅ Defined comprehensive TypeScript types
5. ✅ Configured build tools and dependencies

### Next Steps

In Chapter 2, we'll build the framework core with:
- React providers for state management
- Base route components
- Shopify API integration layer
- Admin dashboard foundation

The foundation is now ready! Let's move to Chapter 2 and start building the actual framework functionality.