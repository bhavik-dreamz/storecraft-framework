# Chapter 2: Framework Core Development

## 🎯 Learning Goals
- Build React providers for state management
- Create base route components  
- Implement Shopify API integration layer
- Set up the admin dashboard foundation
- Create the main framework exports

## 🏗 React Providers Architecture

Our framework uses React Context to provide global state management. Let's build the core providers:

### Cart Provider

Create `src/providers/CartProvider.tsx`:

```tsx
'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Cart, CartLine, UseCartReturn } from '../types';
import { shopifyApi } from '../lib/shopify';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

type CartAction = 
  | { type: 'SET_CART'; payload: Cart }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_CART' }
  | { type: 'UPDATE_LINE'; payload: { lineId: string; quantity: number } }
  | { type: 'REMOVE_LINE'; payload: string };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, cart: action.payload, isLoading: false, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_CART':
      return { ...state, cart: null };
    case 'UPDATE_LINE':
      if (!state.cart) return state;
      const updatedLines = state.cart.lines.map(line => 
        line.id === action.payload.lineId 
          ? { ...line, quantity: action.payload.quantity }
          : line
      );
      return {
        ...state,
        cart: { ...state.cart, lines: updatedLines }
      };
    case 'REMOVE_LINE':
      if (!state.cart) return state;
      const filteredLines = state.cart.lines.filter(line => line.id !== action.payload);
      return {
        ...state,
        cart: { ...state.cart, lines: filteredLines }
      };
    default:
      return state;
  }
};

const CartContext = createContext<UseCartReturn | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: null,
    isLoading: false,
    error: null
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const cartId = localStorage.getItem('storecraft-cart-id');
        
        if (cartId) {
          const cart = await shopifyApi.getCart(cartId);
          dispatch({ type: 'SET_CART', payload: cart });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
      }
    };

    loadCart();
  }, []);

  const addItem = async (variantId: string, quantity: number = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      let cartId = state.cart?.id;
      
      if (!cartId) {
        // Create new cart
        const newCart = await shopifyApi.createCart([
          { merchandiseId: variantId, quantity }
        ]);
        localStorage.setItem('storecraft-cart-id', newCart.id);
        dispatch({ type: 'SET_CART', payload: newCart });
      } else {
        // Add to existing cart
        const updatedCart = await shopifyApi.addToCart(cartId, [
          { merchandiseId: variantId, quantity }
        ]);
        dispatch({ type: 'SET_CART', payload: updatedCart });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
    }
  };

  const removeItem = async (lineId: string) => {
    if (!state.cart) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedCart = await shopifyApi.removeFromCart(state.cart.id, [lineId]);
      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' });
    }
  };

  const updateItem = async (lineId: string, quantity: number) => {
    if (!state.cart) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedCart = await shopifyApi.updateCartLines(state.cart.id, [
        { id: lineId, quantity }
      ]);
      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update item quantity' });
    }
  };

  const clearCart = async () => {
    localStorage.removeItem('storecraft-cart-id');
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{
      cart: state.cart,
      addItem,
      removeItem,
      updateItem,
      clearCart,
      isLoading: state.isLoading,
      error: state.error
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): UseCartReturn => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
```

### Auth Provider

Create `src/providers/AuthProvider.tsx`:

```tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, UseAuthReturn } from '../types';
import { shopifyApi } from '../lib/shopify';

const AuthContext = createContext<UseAuthReturn | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('storecraft-access-token');
        if (token) {
          const customerData = await shopifyApi.getCustomer(token);
          setCustomer(customerData);
        }
      } catch (error) {
        localStorage.removeItem('storecraft-access-token');
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { accessToken, customer: customerData } = await shopifyApi.customerLogin(email, password);
      
      localStorage.setItem('storecraft-access-token', accessToken);
      setCustomer(customerData);
    } catch (error) {
      setError('Invalid email or password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem('storecraft-access-token');
    setCustomer(null);
  };

  const register = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { customer: customerData } = await shopifyApi.customerCreate({
        email,
        password,
        firstName,
        lastName
      });
      
      // Auto-login after registration
      await login(email, password);
    } catch (error) {
      setError('Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      customer,
      login,
      logout,
      register,
      isLoading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### Theme Provider

Create `src/providers/ThemeProvider.tsx`:

```tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreConfig, ThemeConfig } from '../types';

interface ThemeContextValue {
  activeTheme: string;
  themeConfig: ThemeConfig | null;
  storeConfig: StoreConfig | null;
  switchTheme: (themeName: string) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ 
  children: React.ReactNode;
  config: StoreConfig;
}> = ({ children, config }) => {
  const [activeTheme, setActiveTheme] = useState(config.activeTheme);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThemeConfig = async () => {
      try {
        // In a real implementation, this would load from the theme's config file
        const mockThemeConfig: ThemeConfig = {
          name: activeTheme,
          version: '1.0.0',
          author: 'StoreCraft',
          description: `${activeTheme} theme for StoreCraft`,
          pages: ['home', 'product', 'collection', 'cart'],
          components: ['Header', 'Footer', 'ProductCard'],
          layouts: ['default', 'product', 'checkout']
        };
        
        setThemeConfig(mockThemeConfig);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load theme config:', error);
        setIsLoading(false);
      }
    };

    loadThemeConfig();
  }, [activeTheme]);

  const switchTheme = (themeName: string) => {
    setActiveTheme(themeName);
    // In a real implementation, this would update the store.config.js file
    // For now, we just update the state
  };

  return (
    <ThemeContext.Provider value={{
      activeTheme,
      themeConfig,
      storeConfig: config,
      switchTheme,
      isLoading
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### Root Provider

Create `src/providers/RootProvider.tsx`:

```tsx
'use client';

import React from 'react';
import { CartProvider } from './CartProvider';
import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { StoreConfig } from '../types';

interface RootProviderProps {
  children: React.ReactNode;
  config: StoreConfig;
}

export const RootProvider: React.FC<RootProviderProps> = ({ children, config }) => {
  return (
    <ThemeProvider config={config}>
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
```

## 🛣 Base Route Components

Let's create the core route components that themes can override:

### Home Page

Create `src/core/routes/HomePage.tsx`:

```tsx
'use client';

import React from 'react';
import { Product, Collection } from '../../types';
import { ProductGrid } from '../components/ProductGrid';
import { CollectionGrid } from '../components/CollectionGrid';

interface HomePageProps {
  featuredProducts: Product[];
  featuredCollections: Collection[];
}

export const HomePage: React.FC<HomePageProps> = ({ 
  featuredProducts, 
  featuredCollections 
}) => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to Your Store
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover our amazing collection of products, curated just for you.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Shop Now
          </button>
        </div>
      </section>

      {/* Featured Collections */}
      {featuredCollections.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Shop by Category
            </h2>
            <CollectionGrid collections={featuredCollections} />
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Featured Products
            </h2>
            <ProductGrid products={featuredProducts} />
          </div>
        </section>
      )}
    </div>
  );
};
```

### Product Page

Create `src/core/routes/ProductPage.tsx`:

```tsx
'use client';

import React, { useState } from 'react';
import { Product, ProductVariant } from '../../types';
import { useCart } from '../../providers/CartProvider';
import { ProductGallery } from '../components/ProductGallery';
import { ProductForm } from '../components/ProductForm';
import { ProductGrid } from '../components/ProductGrid';

interface ProductPageProps {
  product: Product;
  recommendations: Product[];
}

export const ProductPage: React.FC<ProductPageProps> = ({ 
  product, 
  recommendations 
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0]
  );
  const { addItem, isLoading } = useCart();

  const handleAddToCart = async () => {
    await addItem(selectedVariant.id, 1);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Product Images */}
          <ProductGallery 
            images={product.images} 
            productTitle={product.title}
          />

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-2xl font-bold">
                  ${selectedVariant.price.amount}
                </span>
                {selectedVariant.compareAtPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    ${selectedVariant.compareAtPrice.amount}
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-6">{product.description}</p>
            </div>

            <ProductForm
              product={product}
              selectedVariant={selectedVariant}
              onVariantChange={setSelectedVariant}
              onAddToCart={handleAddToCart}
              isLoading={isLoading}
            />

            {/* Product Details */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2">Product Details</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>Vendor: {product.vendor}</li>
                <li>Type: {product.productType}</li>
                {product.tags.length > 0 && (
                  <li>Tags: {product.tags.join(', ')}</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-8">You might also like</h2>
            <ProductGrid products={recommendations} />
          </section>
        )}
      </div>
    </div>
  );
};
```

### Collection Page

Create `src/core/routes/CollectionPage.tsx`:

```tsx
'use client';

import React, { useState } from 'react';
import { Collection, Product } from '../../types';
import { ProductGrid } from '../components/ProductGrid';

interface CollectionPageProps {
  collection: Collection;
  products: Product[];
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
}

export const CollectionPage: React.FC<CollectionPageProps> = ({
  collection,
  products,
  pagination
}) => {
  const [sortBy, setSortBy] = useState('BEST_SELLING');
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    vendor: '',
    productType: '',
    available: true
  });

  return (
    <div className="min-h-screen">
      {/* Collection Header */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">{collection.title}</h1>
            {collection.description && (
              <p className="text-lg text-gray-600">{collection.description}</p>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Sort By</h3>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="BEST_SELLING">Best Selling</option>
                <option value="PRICE_LOW_TO_HIGH">Price: Low to High</option>
                <option value="PRICE_HIGH_TO_LOW">Price: High to Low</option>
                <option value="NEWEST">Newest</option>
                <option value="OLDEST">Oldest</option>
                <option value="ALPHABETICAL">A-Z</option>
                <option value="REVERSE_ALPHABETICAL">Z-A</option>
              </select>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Price Range</h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters({
                    ...filters,
                    priceRange: [filters.priceRange[0], parseInt(e.target.value)]
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${filters.priceRange[0]}</span>
                  <span>${filters.priceRange[1]}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.available}
                  onChange={(e) => setFilters({
                    ...filters,
                    available: e.target.checked
                  })}
                  className="mr-2"
                />
                In Stock Only
              </label>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                {products.length} products
              </p>
            </div>

            <ProductGrid products={products} />

            {/* Pagination */}
            {(pagination.hasNextPage || pagination.hasPreviousPage) && (
              <div className="mt-12 flex justify-center space-x-4">
                {pagination.hasPreviousPage && (
                  <button className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    Previous
                  </button>
                )}
                {pagination.hasNextPage && (
                  <button className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    Next
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
```

## 🧩 Base Components

Let's create the essential UI components:

### Product Grid

Create `src/core/components/ProductGrid.tsx`:

```tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../../types';

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  columns = 4 
}) => {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.handle}`}
          className="group block"
        >
          <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-square relative bg-gray-100">
              {product.images[0] && (
                <Image
                  src={product.images[0].url}
                  alt={product.images[0].altText || product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              {!product.availableForSale && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-semibold">Sold Out</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-1 group-hover:text-blue-600 transition-colors">
                {product.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{product.vendor}</p>
              <div className="flex items-center space-x-2">
                <span className="font-bold">
                  ${product.price.amount}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ${product.compareAtPrice.amount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
```

## 📤 Framework Main Export

Create `src/index.ts`:

```typescript
// Providers
export { RootProvider } from './providers/RootProvider';
export { CartProvider, useCart } from './providers/CartProvider';
export { AuthProvider, useAuth } from './providers/AuthProvider';
export { ThemeProvider, useTheme } from './providers/ThemeProvider';

// Core Routes
export { HomePage } from './core/routes/HomePage';
export { ProductPage } from './core/routes/ProductPage';
export { CollectionPage } from './core/routes/CollectionPage';

// Core Components
export { ProductGrid } from './core/components/ProductGrid';

// Shopify API
export { shopifyApi } from './lib/shopify';

// Types
export * from './types';

// Utilities
export { cn } from './lib/utils';
export { formatPrice, formatDate } from './lib/formatters';
```

Create utility functions in `src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Create formatters in `src/lib/formatters.ts`:

```typescript
import { Money } from '../types';

export function formatPrice(money: Money): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currencyCode,
  }).format(parseFloat(money.amount));
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}
```

## 🎉 Chapter 2 Summary

In this chapter, we've built:
1. ✅ Complete React provider system (Cart, Auth, Theme)
2. ✅ Base route components (Home, Product, Collection)
3. ✅ Essential UI components (ProductGrid)
4. ✅ Utility functions and formatters
5. ✅ Main framework exports

### Next Steps

In Chapter 3, we'll create the theme system:
- Theme override mechanism
- Theme structure and templates
- Route resolution logic
- Component inheritance system

The framework core is now solid! Ready for Chapter 3?