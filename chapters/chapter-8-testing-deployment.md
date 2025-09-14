# Chapter 8: Testing, Documentation & Deployment

## 🎯 Learning Goals
- Implement comprehensive testing strategies
- Create performance optimizations  
- Build complete documentation
- Set up CI/CD pipelines
- Publish packages to NPM
- Deploy example applications

## 🧪 Testing Architecture

### Testing Strategy Overview

Our testing approach covers multiple layers:

```
Testing Pyramid:
├── Unit Tests (70%)           → Individual functions, components
├── Integration Tests (20%)    → API routes, provider interactions  
├── E2E Tests (10%)           → User workflows, theme switching
└── Performance Tests         → Load testing, bundle analysis
```

### Unit Testing Setup

Create `jest.config.js`:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^storecraft-framework/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
}

module.exports = createJestConfig(customJestConfig)
```

Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock environment variables
process.env = {
  ...process.env,
  SHOPIFY_DOMAIN: 'test-store.myshopify.com',
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: 'test-token',
  STORECRAFT_ACTIVE_THEME: 'default',
}

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
```

### Component Testing

Create `src/__tests__/components/ProductCard.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProductCard } from '@/core/components/ProductCard'
import { CartProvider } from '@/providers/CartProvider'
import { mockProduct } from '../__mocks__/mockData'

// Mock the cart hook
const mockAddItem = jest.fn()
jest.mock('@/providers/CartProvider', () => ({
  ...jest.requireActual('@/providers/CartProvider'),
  useCart: () => ({
    addItem: mockAddItem,
    cart: null,
    isLoading: false,
    error: null,
  }),
}))

describe('ProductCard', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <CartProvider>
        {ui}
      </CartProvider>
    )
  }

  beforeEach(() => {
    mockAddItem.mockClear()
  })

  it('renders product information correctly', () => {
    renderWithProviders(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText(mockProduct.title)).toBeInTheDocument()
    expect(screen.getByText(mockProduct.vendor)).toBeInTheDocument()
    expect(screen.getByText(`$${mockProduct.price.amount}`)).toBeInTheDocument()
  })

  it('shows discount badge when compareAtPrice exists', () => {
    const discountedProduct = {
      ...mockProduct,
      compareAtPrice: { amount: '200.00', currencyCode: 'USD' }
    }
    
    renderWithProviders(<ProductCard product={discountedProduct} />)
    
    expect(screen.getByText('-50%')).toBeInTheDocument()
  })

  it('handles quick add to cart', async () => {
    renderWithProviders(<ProductCard product={mockProduct} showQuickAdd />)
    
    const quickAddButton = screen.getByText('Quick Add')
    fireEvent.click(quickAddButton)
    
    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith(mockProduct.variants[0].id, 1)
    })
  })

  it('shows sold out badge when not available', () => {
    const soldOutProduct = {
      ...mockProduct,
      availableForSale: false
    }
    
    renderWithProviders(<ProductCard product={soldOutProduct} />)
    
    expect(screen.getByText('Sold Out')).toBeInTheDocument()
  })

  it('toggles wishlist on click', () => {
    renderWithProviders(<ProductCard product={mockProduct} showWishlist />)
    
    const wishlistButton = screen.getByRole('button', { name: /wishlist/i })
    fireEvent.click(wishlistButton)
    
    // Should change color or icon to indicate added to wishlist
    expect(wishlistButton).toHaveClass('bg-red-500')
  })

  it('has correct accessibility attributes', () => {
    renderWithProviders(<ProductCard product={mockProduct} />)
    
    const productLink = screen.getByRole('link', { name: new RegExp(mockProduct.title) })
    expect(productLink).toHaveAttribute('href', `/products/${mockProduct.handle}`)
    
    const productImage = screen.getByRole('img')
    expect(productImage).toHaveAttribute('alt', expect.stringContaining(mockProduct.title))
  })
})
```

### API Testing

Create `src/__tests__/lib/shopify/api.test.ts`:

```typescript
import { ShopifyAPI } from '@/lib/shopify/api'
import { getShopifyClient } from '@/lib/shopify/client'
import { mockStoreConfig, mockProduct, mockCart } from '../__mocks__/mockData'

// Mock the GraphQL client
jest.mock('@/lib/shopify/client')
const mockClient = {
  storefrontQuery: jest.fn(),
  adminQuery: jest.fn(),
}

describe('ShopifyAPI', () => {
  let shopifyAPI: ShopifyAPI

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getShopifyClient as jest.Mock).mockReturnValue(mockClient)
    shopifyAPI = new ShopifyAPI(mockStoreConfig)
  })

  describe('getProducts', () => {
    it('fetches products successfully', async () => {
      const mockResponse = {
        products: {
          edges: [{ node: mockProduct, cursor: 'cursor1' }],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: 'cursor1',
            endCursor: 'cursor1',
          },
        },
      }

      mockClient.storefrontQuery.mockResolvedValue(mockResponse)

      const result = await shopifyAPI.getProducts({ first: 10 })

      expect(result.products).toHaveLength(1)
      expect(result.products[0].id).toBe(mockProduct.id)
      expect(result.pageInfo.hasNextPage).toBe(true)
    })

    it('handles API errors gracefully', async () => {
      mockClient.storefrontQuery.mockRejectedValue(new Error('API Error'))

      await expect(shopifyAPI.getProducts()).rejects.toThrow('API Error')
    })
  })

  describe('createCart', () => {
    it('creates cart successfully', async () => {
      const mockResponse = {
        cartCreate: {
          cart: mockCart,
          userErrors: [],
        },
      }

      mockClient.storefrontQuery.mockResolvedValue(mockResponse)

      const result = await shopifyAPI.createCart([
        { merchandiseId: 'variant-1', quantity: 1 }
      ])

      expect(result.id).toBe(mockCart.id)
      expect(result.totalQuantity).toBe(mockCart.totalQuantity)
    })

    it('handles user errors from Shopify', async () => {
      const mockResponse = {
        cartCreate: {
          cart: null,
          userErrors: [{ field: ['lines'], message: 'Invalid variant' }],
        },
      }

      mockClient.storefrontQuery.mockResolvedValue(mockResponse)

      await expect(
        shopifyAPI.createCart([{ merchandiseId: 'invalid', quantity: 1 }])
      ).rejects.toThrow('Invalid variant')
    })
  })

  describe('customerLogin', () => {
    it('logs in customer successfully', async () => {
      const mockLoginResponse = {
        customerAccessTokenCreate: {
          customerAccessToken: {
            accessToken: 'access-token',
            expiresAt: '2024-01-01',
          },
          customerUserErrors: [],
        },
      }

      const mockCustomerResponse = {
        customer: {
          id: 'customer-1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      }

      mockClient.storefrontQuery
        .mockResolvedValueOnce(mockLoginResponse)
        .mockResolvedValueOnce(mockCustomerResponse)

      const result = await shopifyAPI.customerLogin('test@example.com', 'password')

      expect(result.accessToken).toBe('access-token')
      expect(result.customer.email).toBe('test@example.com')
    })
  })
})
```

### Integration Testing

Create `src/__tests__/integration/cart-flow.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RootProvider } from '@/providers/RootProvider'
import { ProductCard } from '@/core/components/ProductCard'
import { Cart } from '@/core/components/Cart'
import { mockStoreConfig, mockProduct } from '../__mocks__/mockData'

describe('Cart Integration', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <RootProvider config={mockStoreConfig}>
        {ui}
      </RootProvider>
    )
  }

  it('adds product to cart and updates cart count', async () => {
    renderWithProviders(
      <div>
        <ProductCard product={mockProduct} showQuickAdd />
        <Cart />
      </div>
    )

    // Initially cart should be empty
    expect(screen.queryByText('1')).not.toBeInTheDocument()

    // Add product to cart
    const quickAddButton = screen.getByText('Quick Add')
    fireEvent.click(quickAddButton)

    // Wait for cart to update
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    // Product should appear in cart
    expect(screen.getByText(mockProduct.title)).toBeInTheDocument()
  })

  it('handles quantity updates in cart', async () => {
    renderWithProviders(<Cart />)

    // Simulate cart with item
    const increaseButton = screen.getByLabelText('Increase quantity')
    fireEvent.click(increaseButton)

    await waitFor(() => {
      expect(screen.getByDisplayValue('2')).toBeInTheDocument()
    })
  })
})
```

## 🚀 Performance Optimization

### Bundle Analysis

Create `scripts/analyze-bundle.js`:

```javascript
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      )
    }
    return config
  },
}
```

### Performance Monitoring

Create `src/lib/performance/monitor.ts`:

```typescript
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTiming(label: string): void {
    performance.mark(`${label}-start`)
  }

  endTiming(label: string): number {
    performance.mark(`${label}-end`)
    performance.measure(label, `${label}-start`, `${label}-end`)
    
    const entries = performance.getEntriesByName(label)
    const duration = entries[entries.length - 1]?.duration || 0
    
    this.metrics.set(label, duration)
    return duration
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  reportWebVitals(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log(`${entry.name}: ${entry.value}ms`)
          
          // Send to analytics
          if (typeof gtag !== 'undefined') {
            gtag('event', 'web_vitals', {
              name: entry.name,
              value: Math.round(entry.value),
              event_category: 'performance',
            })
          }
        })
      })

      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] })
    }
  }
}

// Hook for measuring component render times
export function usePerformanceTimer(componentName: string) {
  const monitor = PerformanceMonitor.getInstance()
  
  React.useEffect(() => {
    monitor.startTiming(`${componentName}-render`)
    
    return () => {
      monitor.endTiming(`${componentName}-render`)
    }
  }, [componentName])
}
```

### Image Optimization

Create `src/lib/utils/image-optimizer.ts`:

```typescript
interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  quality?: number
  priority?: boolean
  className?: string
}

export function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  quality = 85,
  priority = false,
  className = '',
}: OptimizedImageProps) {
  // Generate srcset for responsive images
  const generateSrcSet = (baseSrc: string) => {
    const sizes = [480, 768, 1024, 1280, 1600]
    return sizes
      .map(size => `${baseSrc}?w=${size}&q=${quality} ${size}w`)
      .join(', ')
  }

  // Generate sizes attribute based on breakpoints
  const sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'

  return (
    <img
      src={`${src}?w=${width}&h=${height}&q=${quality}`}
      srcSet={generateSrcSet(src)}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}

export function generateImageBlurDataURL(width: number, height: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  
  ctx.fillStyle = '#f3f4f6'
  ctx.fillRect(0, 0, width, height)
  
  return canvas.toDataURL()
}
```

## 📖 Complete Documentation

### API Documentation

Create `docs/api-reference.md`:

```markdown
# StoreCraft Framework API Reference

## Core Providers

### CartProvider

Manages shopping cart state and operations.

```tsx
import { CartProvider, useCart } from 'storecraft-framework';

function App() {
  return (
    <CartProvider>
      <YourComponents />
    </CartProvider>
  );
}

function YourComponent() {
  const { cart, addItem, removeItem, updateItem } = useCart();
  
  // Add item to cart
  const handleAddToCart = async () => {
    await addItem('variant-id', 1);
  };
  
  return (
    <div>
      <p>Items in cart: {cart?.totalQuantity || 0}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}
```

#### useCart Hook

Returns cart state and operations:

- `cart: Cart | null` - Current cart object
- `addItem: (variantId: string, quantity: number) => Promise<void>` - Add item to cart
- `removeItem: (lineId: string) => Promise<void>` - Remove item from cart
- `updateItem: (lineId: string, quantity: number) => Promise<void>` - Update item quantity
- `clearCart: () => Promise<void>` - Clear entire cart
- `isLoading: boolean` - Loading state for cart operations
- `error: string | null` - Error message if operation failed

### AuthProvider

Manages customer authentication.

```tsx
import { AuthProvider, useAuth } from 'storecraft-framework';

function YourComponent() {
  const { customer, login, logout, register } = useAuth();
  
  const handleLogin = async () => {
    await login('email@example.com', 'password');
  };
  
  return (
    <div>
      {customer ? (
        <p>Welcome, {customer.firstName}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### ThemeProvider

Manages theme configuration and switching.

```tsx
import { ThemeProvider, useTheme } from 'storecraft-framework';

function YourComponent() {
  const { activeTheme, themeConfig, switchTheme } = useTheme();
  
  return (
    <div>
      <p>Active theme: {activeTheme}</p>
      <button onClick={() => switchTheme('modern')}>
        Switch to Modern
      </button>
    </div>
  );
}
```

## Shopify API

### Product Operations

```tsx
import { shopifyApi } from 'storecraft-framework';

// Get products with pagination
const { products, pageInfo } = await shopifyApi.getProducts({
  first: 20,
  sortKey: 'BEST_SELLING',
  query: 'tag:featured'
});

// Get single product by handle
const product = await shopifyApi.getProductByHandle('product-handle');

// Get product recommendations
const recommendations = await shopifyApi.getRecommendedProducts(productId, 4);
```

### Cart Operations

```tsx
// Create new cart
const cart = await shopifyApi.createCart([
  { merchandiseId: 'variant-id', quantity: 1 }
]);

// Add items to existing cart
const updatedCart = await shopifyApi.addToCart(cartId, [
  { merchandiseId: 'variant-id', quantity: 2 }
]);

// Update cart line quantities
const cart = await shopifyApi.updateCartLines(cartId, [
  { id: 'line-id', quantity: 3 }
]);

// Remove items from cart
const cart = await shopifyApi.removeFromCart(cartId, ['line-id']);
```

## Theme Development

### Creating a Theme

1. Create theme directory: `themes/my-theme/`
2. Add theme configuration: `theme.config.json`
3. Override components in: `components/`
4. Override pages in: `pages/`
5. Add styles in: `styles/`

### Theme Configuration

```json
{
  "name": "My Theme",
  "version": "1.0.0",
  "description": "Custom theme description",
  "author": {
    "name": "Your Name",
    "email": "your@email.com"
  },
  "settings": {
    "colors": {
      "primary": "#3B82F6",
      "secondary": "#6B7280",
      "accent": "#F59E0B"
    },
    "typography": {
      "fontFamily": "Inter, sans-serif"
    }
  }
}
```

### Component Override

Create `themes/my-theme/components/Header.tsx`:

```tsx
import { Header as BaseHeader } from 'storecraft-framework';

export function Header() {
  return (
    <header className="my-custom-header">
      <BaseHeader />
      {/* Your customizations */}
    </header>
  );
}
```
```

### User Guide

Create `docs/user-guide.md`:

```markdown
# StoreCraft Framework User Guide

## Getting Started

### 1. Create a New Project

```bash
npx create-myshop my-store
cd my-store
```

### 2. Configure Your Store

Edit `store.config.js`:

```javascript
module.exports = {
  activeTheme: 'default',
  shopify: {
    domain: 'your-store.myshopify.com',
    storefrontAccessToken: 'your-storefront-token',
  }
};
```

### 3. Set Environment Variables

Create `.env.local`:

```
SHOPIFY_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-token
```

### 4. Start Development Server

```bash
myshop dev
```

## Theme Management

### List Available Themes

```bash
myshop theme list
```

### Switch Themes

```bash
myshop theme switch modern
```

### Create Custom Theme

```bash
myshop theme create my-theme --base default
```

### Install Theme from NPM

```bash
myshop theme install storecraft-theme-minimal
```

## Building for Production

### Build Application

```bash
myshop build
```

### Start Production Server

```bash
myshop start
```

### Deploy to Vercel

```bash
myshop deploy vercel
```

## Customization

### Custom Components

Override any component by creating it in your theme:

```
themes/my-theme/
├── components/
│   ├── Header.tsx      # Override header
│   ├── Footer.tsx      # Override footer
│   └── ProductCard.tsx # Override product card
```

### Custom Pages

Create custom pages:

```
themes/my-theme/
├── pages/
│   ├── about.tsx       # Custom about page
│   └── contact.tsx     # Custom contact page
```

### Custom Styles

Add theme-specific styles:

```css
/* themes/my-theme/styles/globals.css */
.my-theme {
  --color-primary: #your-color;
}

.custom-button {
  background: var(--color-primary);
  border-radius: 8px;
}
```
```

## 🏗 CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run type check
      run: npm run type-check
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: npm run test:ci
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
    
    - name: Build project
      run: npm run build

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js 18
      uses: actions/setup-node@v4
      with:
        node-version: 18
        registry-url: 'https://registry.npmjs.org'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build packages
      run: npm run build
    
    - name: Publish to NPM
      run: npm publish
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

  deploy-example:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        working-directory: ./examples/demo-store
```

### Semantic Release

Create `.releaserc.json`:

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        "assets": ["CHANGELOG.md", "package.json"],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ]
  ]
}
```

## 📦 NPM Publishing

### Package.json Configuration

Update `package.json` for publishing:

```json
{
  "name": "storecraft-framework",
  "version": "1.0.0",
  "description": "Theme-based framework for Shopify headless stores",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./next-plugin": "./dist/next-plugin.js",
    "./types": "./dist/types/index.d.ts"
  },
  "files": [
    "dist",
    "templates",
    "README.md",
    "LICENSE"
  ],
  "keywords": [
    "shopify",
    "headless",
    "nextjs",
    "ecommerce",
    "framework",
    "themes"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/storecraft-framework.git"
  },
  "bugs": {
    "url": "https://github.com/your-username/storecraft-framework/issues"
  },
  "homepage": "https://storecraft-framework.com",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  }
}
```

### Pre-publish Checklist

Create `scripts/pre-publish.js`:

```javascript
const fs = require('fs');
const path = require('path');

console.log('🔍 Running pre-publish checks...');

// Check if dist directory exists
if (!fs.existsSync('dist')) {
  console.error('❌ dist directory not found. Run npm run build first.');
  process.exit(1);
}

// Check if required files exist
const requiredFiles = [
  'dist/index.js',
  'dist/index.d.ts',
  'dist/next-plugin.js',
  'README.md',
  'LICENSE'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Required file ${file} not found.`);
    process.exit(1);
  }
}

// Check package.json version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!packageJson.version || packageJson.version === '0.0.0') {
  console.error('❌ Package version not set.');
  process.exit(1);
}

console.log('✅ All pre-publish checks passed!');
```

## 🎉 Chapter 8 Summary

In this final chapter, we've implemented:
1. ✅ Comprehensive testing strategy (unit, integration, e2e)
2. ✅ Performance monitoring and optimization tools
3. ✅ Complete API documentation and user guides
4. ✅ CI/CD pipeline with automated testing and deployment
5. ✅ NPM publishing configuration and workflows

### Complete Framework Features:
- **Framework Core**: React providers, base components, Shopify integration
- **Theme System**: Override mechanism, component inheritance, customization
- **Next.js Plugin**: Route merging, theme loading, build optimizations
- **CLI Tool**: Project scaffolding, theme management, development commands
- **Testing Suite**: Unit, integration, and performance tests
- **Documentation**: API reference, user guides, examples
- **Production Ready**: CI/CD, monitoring, deployment strategies

## 🚀 Final Project Structure

```
storecraft-ecosystem/
├── packages/
│   ├── storecraft-framework/       # Main framework package
│   ├── create-myshop/             # CLI tool
│   └── themes/                    # Official theme packages
├── examples/
│   ├── demo-store/               # Example implementation
│   ├── fashion-store/            # Fashion-focused example
│   └── electronics-store/        # Electronics example
├── docs/
│   ├── api-reference.md          # Complete API docs
│   ├── user-guide.md            # User documentation
│   └── theme-development.md      # Theme creation guide
├── tests/
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   └── e2e/                    # End-to-end tests
└── .github/
    └── workflows/               # CI/CD pipelines
```

## 🎓 What You've Built

Congratulations! You've successfully built a complete **theme-based framework** that:

- **Abstracts Next.js complexity** while maintaining full flexibility
- **Provides WordPress-like theme management** for React applications
- **Integrates seamlessly with Shopify** for headless e-commerce
- **Offers professional developer tools** (CLI, testing, deployment)
- **Follows industry best practices** for performance and maintainability

Your framework is now ready for production use and can serve as the foundation for countless Shopify headless storefronts!

### Next Steps
- Publish to NPM registry
- Create community themes
- Build documentation website
- Set up support channels
- Gather user feedback and iterate

**You've mastered advanced React/Next.js framework development!** 🎉