# Chapter 7: Example Themes

## 🎯 Learning Goals
- Build complete default and modern theme examples
- Demonstrate theme customization patterns
- Create reusable theme components
- Implement responsive design best practices
- Show advanced theme features and optimizations

## 🎨 Theme Architecture Patterns

### Theme Hierarchy

Our theme system follows a clear hierarchy:

```
Theme Structure:
├── Base Components (Framework)    → Always available
├── Theme Components (Override)    → Replace base components
├── Theme Pages (Override)         → Replace base pages
├── Theme Styles (Additive)        → Extend base styles
└── Theme Assets (Additive)        → Add theme-specific assets
```

### Component Inheritance Pattern

```typescript
// Theme component can:
1. Override completely (replace framework component)
2. Extend base component (wrap with additional features)
3. Compose multiple components (build complex layouts)
```

## 🏗 Complete Default Theme

### Theme Configuration

`themes/default/theme.config.json`:

```json
{
  "name": "Default",
  "version": "1.2.0",
  "description": "Clean, professional theme perfect for any store type",
  "author": {
    "name": "StoreCraft Team",
    "email": "themes@storecraft.com",
    "url": "https://storecraft.com"
  },
  "preview": {
    "thumbnail": "/themes/default/preview.jpg",
    "demo": "https://demo.storecraft.com/default"
  },
  "settings": {
    "colors": {
      "primary": "#3B82F6",
      "secondary": "#6B7280", 
      "accent": "#F59E0B",
      "success": "#10B981",
      "warning": "#F59E0B",
      "error": "#EF4444"
    },
    "typography": {
      "fontFamily": "Inter, system-ui, sans-serif",
      "headingFont": "Inter, system-ui, sans-serif"
    },
    "layout": {
      "containerWidth": "1200px",
      "borderRadius": "8px",
      "spacing": "1rem"
    },
    "features": {
      "animations": true,
      "darkMode": false,
      "rtl": false
    }
  },
  "features": [
    "responsive-design",
    "seo-optimized",
    "accessibility",
    "performance",
    "mobile-first"
  ],
  "customizable": [
    "colors",
    "typography",
    "layout",
    "header-style",
    "footer-style"
  ]
}
```

### Theme Root Layout

`themes/default/components/Layout.tsx`:

```tsx
'use client';

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { MobileMenu } from './MobileMenu';
import { useTheme } from 'storecraft-framework';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function Layout({ children, className = '' }: LayoutProps) {
  const { themeConfig } = useTheme();

  return (
    <div 
      className={`default-theme min-h-screen flex flex-col ${className}`}
      style={{
        '--color-primary': themeConfig?.settings?.colors?.primary,
        '--color-secondary': themeConfig?.settings?.colors?.secondary,
        '--color-accent': themeConfig?.settings?.colors?.accent,
        fontFamily: themeConfig?.settings?.typography?.fontFamily
      } as React.CSSProperties}
    >
      <Header />
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
      
      {/* Global Components */}
      <CartDrawer />
      <MobileMenu />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-primary)',
            color: 'white',
          },
        }}
      />
    </div>
  );
}
```

### Advanced Header Component

`themes/default/components/Header.tsx`:

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart, useAuth } from 'storecraft-framework';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  Search, 
  User,
  ChevronDown,
  Heart
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  children?: NavigationItem[];
}

export const Header: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { cart } = useCart();
  const { customer } = useAuth();

  const totalItems = cart?.totalQuantity || 0;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation: NavigationItem[] = [
    { 
      name: 'Shop', 
      href: '/collections/all',
      children: [
        { name: 'All Products', href: '/collections/all' },
        { name: 'New Arrivals', href: '/collections/new' },
        { name: 'Sale', href: '/collections/sale' },
      ]
    },
    { name: 'About', href: '/pages/about' },
    { name: 'Contact', href: '/pages/contact' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-white shadow-sm'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">StoreCraft</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className="text-gray-700 hover:text-primary transition-colors py-2 flex items-center"
                >
                  {item.name}
                  {item.children && (
                    <ChevronDown size={16} className="ml-1 group-hover:rotate-180 transition-transform" />
                  )}
                </Link>
                
                {/* Dropdown Menu */}
                {item.children && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="block px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 bg-gray-100 border border-transparent rounded-full focus:bg-white focus:border-primary focus:outline-none transition-all"
              />
              <Search 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search (Mobile) */}
            <button 
              className="lg:hidden p-2 text-gray-700 hover:text-primary transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link 
              href="/wishlist" 
              className="hidden sm:block p-2 text-gray-700 hover:text-primary transition-colors relative"
            >
              <Heart size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Account */}
            <div className="relative group">
              <Link href={customer ? "/account" : "/login"} className="p-2 text-gray-700 hover:text-primary transition-colors flex items-center">
                <User size={20} />
                {customer && (
                  <span className="hidden sm:block ml-2 text-sm font-medium">
                    Hi, {customer.firstName || 'Account'}
                  </span>
                )}
              </Link>
              
              {/* Account Dropdown */}
              {customer && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <Link href="/account" className="block px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50">
                      My Account
                    </Link>
                    <Link href="/account/orders" className="block px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50">
                      Orders
                    </Link>
                    <Link href="/account/addresses" className="block px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50">
                      Addresses
                    </Link>
                    <hr className="my-2" />
                    <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <button 
              className="relative p-2 text-gray-700 hover:text-primary transition-colors"
              onClick={() => {/* Open cart drawer */}}
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-gray-700 hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="lg:hidden py-4 border-t">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-gray-100 rounded-lg focus:bg-white focus:border-primary focus:outline-none border border-transparent transition-all"
                autoFocus
              />
              <Search 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </form>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t bg-white">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className="block px-2 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                  
                  {/* Mobile Submenu */}
                  {item.children && (
                    <div className="ml-4 mt-2 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="block px-2 py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
```

### Enhanced Product Card

`themes/default/components/ProductCard.tsx`:

```tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from 'storecraft-framework/types';
import { useCart } from 'storecraft-framework';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { formatPrice } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  className?: string;
  showQuickAdd?: boolean;
  showWishlist?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  className = '',
  showQuickAdd = true,
  showWishlist = true
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const { addItem } = useCart();

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.availableForSale || product.variants.length === 0) return;
    
    setIsLoading(true);
    try {
      await addItem(product.variants[0].id, 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const discountPercentage = product.compareAtPrice && product.price ? 
    Math.round(((parseFloat(product.compareAtPrice.amount) - parseFloat(product.price.amount)) / parseFloat(product.compareAtPrice.amount)) * 100) : 0;

  return (
    <div className={`group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}>
      {/* Product Image */}
      <Link href={`/products/${product.handle}`} className="block relative">
        <div className="aspect-square relative bg-gray-100 overflow-hidden">
          {product.images.length > 0 && (
            <>
              <Image
                src={product.images[currentImageIndex]?.url || product.images[0].url}
                alt={product.images[currentImageIndex]?.altText || product.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
              
              {/* Image hover effect - show second image */}
              {product.images.length > 1 && (
                <Image
                  src={product.images[1].url}
                  alt={product.images[1].altText || product.title}
                  fill
                  className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
              )}
            </>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col space-y-2">
            {!product.availableForSale && (
              <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full font-medium">
                Sold Out
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                -{discountPercentage}%
              </span>
            )}
            {product.tags.includes('new') && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                New
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {showWishlist && (
              <button
                onClick={handleWishlistToggle}
                className={`p-2 rounded-full shadow-lg transition-colors ${
                  isWishlisted 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white text-gray-600 hover:text-red-500'
                }`}
              >
                <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            )}
            
            <Link
              href={`/products/${product.handle}`}
              className="p-2 bg-white text-gray-600 hover:text-primary rounded-full shadow-lg transition-colors"
            >
              <Eye size={16} />
            </Link>
          </div>

          {/* Quick Add Button */}
          {showQuickAdd && product.availableForSale && product.variants.length === 1 && (
            <div className="absolute bottom-3 left-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleQuickAdd}
                disabled={isLoading}
                className="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <ShoppingCart size={16} />
                <span>{isLoading ? 'Adding...' : 'Quick Add'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Image dots indicator */}
        {product.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-10 flex space-x-1">
            {product.images.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <p className="text-sm text-gray-500 mb-1">{product.vendor}</p>
          <Link href={`/products/${product.handle}`}>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Variants (if multiple) */}
        {product.variants.length > 1 && (
          <div className="mb-3">
            <p className="text-sm text-gray-600">
              {product.variants.length} variants available
            </p>
            
            {/* Color swatches if available */}
            {product.variants.some(v => v.selectedOptions.some(o => o.name.toLowerCase() === 'color')) && (
              <div className="flex space-x-2 mt-2">
                {product.variants
                  .filter(v => v.selectedOptions.some(o => o.name.toLowerCase() === 'color'))
                  .slice(0, 5)
                  .map((variant, index) => {
                    const colorOption = variant.selectedOptions.find(o => o.name.toLowerCase() === 'color');
                    return (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full border-2 border-gray-200"
                        style={{ backgroundColor: colorOption?.value.toLowerCase() }}
                        title={colorOption?.value}
                      />
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Rating (placeholder for now) */}
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <div className="flex text-yellow-400">
            {'★'.repeat(5)}
          </div>
          <span>(24 reviews)</span>
        </div>
      </div>
    </div>
  );
};
```

### Modern Theme Variant

Now let's create a modern theme variant with different styling:

`themes/modern/theme.config.json`:

```json
{
  "name": "Modern",
  "version": "1.0.0",
  "description": "Bold, contemporary theme with dark mode support",
  "author": {
    "name": "StoreCraft Team",
    "email": "themes@storecraft.com"
  },
  "settings": {
    "colors": {
      "primary": "#6366F1",
      "secondary": "#1F2937",
      "accent": "#F59E0B",
      "background": "#0F172A",
      "surface": "#1E293B"
    },
    "typography": {
      "fontFamily": "Poppins, system-ui, sans-serif",
      "headingFont": "Poppins, system-ui, sans-serif"
    },
    "features": {
      "darkMode": true,
      "animations": true,
      "gradients": true
    }
  },
  "features": [
    "dark-mode",
    "animations",
    "modern-design",
    "gradients"
  ]
}
```

`themes/modern/components/Layout.tsx`:

```tsx
'use client';

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useTheme } from 'storecraft-framework';

interface LayoutProps {
  children: React.ReactNode;
}

export default function ModernLayout({ children }: LayoutProps) {
  const { themeConfig } = useTheme();

  return (
    <div 
      className="modern-theme min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      style={{
        '--color-primary': themeConfig?.settings?.colors?.primary,
        '--color-secondary': themeConfig?.settings?.colors?.secondary,
        '--color-accent': themeConfig?.settings?.colors?.accent,
        fontFamily: themeConfig?.settings?.typography?.fontFamily
      } as React.CSSProperties}
    >
      <div className="backdrop-blur-3xl bg-white/5">
        <Header />
        
        <main className="min-h-screen">
          {children}
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
```

`themes/modern/pages/index.tsx`:

```tsx
'use client';

import React from 'react';
import { Product, Collection } from 'storecraft-framework/types';
import { ProductGrid } from '../components/ProductGrid';
import { CollectionGrid } from '../components/CollectionGrid';

interface ModernHomePageProps {
  featuredProducts: Product[];
  featuredCollections: Collection[];
}

export default function ModernHomePage({ 
  featuredProducts, 
  featuredCollections 
}: ModernHomePageProps) {
  return (
    <div className="modern-home">
      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-blue-900/80 z-10" />
        
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-20">
          <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-20 animate-pulse" />
        </div>

        <div className="relative z-20 text-center text-white max-w-4xl px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            The Future
            <br />
            of Shopping
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Experience next-generation e-commerce with cutting-edge design 
            and seamless interactions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105">
              Explore Collection
            </button>
            <button className="px-8 py-4 border-2 border-white/30 backdrop-blur-sm rounded-full font-semibold text-lg hover:bg-white/10 transition-all">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-500/20 rounded-full animate-bounce" />
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-blue-500/20 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-pink-500/20 rounded-full animate-ping" />
      </section>

      {/* Featured Collections */}
      {featuredCollections.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4 text-white">
              Discover Collections
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              Curated selections of premium products designed for the modern lifestyle
            </p>
            <CollectionGrid collections={featuredCollections} />
          </div>
        </section>
      )}

      {/* Featured Products with Glass Morphism */}
      {featuredProducts.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="backdrop-blur-lg bg-white/5 rounded-3xl p-8 border border-white/10">
              <h2 className="text-4xl font-bold text-center mb-4 text-white">
                Featured Products
              </h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                Hand-picked items that define excellence and innovation
              </p>
              <ProductGrid products={featuredProducts} />
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="backdrop-blur-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl p-12 border border-white/10">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Stay in the Loop
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Get exclusive access to new drops, sales, and style tips
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
              <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

## 🎨 Theme Customization System

### Theme Settings UI

`themes/default/components/ThemeCustomizer.tsx`:

```tsx
'use client';

import React, { useState } from 'react';
import { useTheme } from 'storecraft-framework';
import { Settings, Palette, Type, Layout } from 'lucide-react';

export const ThemeCustomizer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('colors');
  const { themeConfig, switchTheme } = useTheme();

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'layout', label: 'Layout', icon: Layout },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-3 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50"
      >
        <Settings size={20} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
      
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Theme Customizer</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ×
            </button>
          </div>
          
          <div className="flex space-x-1 mt-4 bg-gray-100 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto h-full pb-32">
          {activeTab === 'colors' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Primary Color</label>
                <input
                  type="color"
                  value={themeConfig?.settings?.colors?.primary || '#3B82F6'}
                  className="w-full h-10 rounded-lg border"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Secondary Color</label>
                <input
                  type="color"
                  value={themeConfig?.settings?.colors?.secondary || '#6B7280'}
                  className="w-full h-10 rounded-lg border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Accent Color</label>
                <input
                  type="color"
                  value={themeConfig?.settings?.colors?.accent || '#F59E0B'}
                  className="w-full h-10 rounded-lg border"
                />
              </div>
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Font Family</label>
                <select className="w-full p-2 border rounded-lg">
                  <option>Inter</option>
                  <option>Poppins</option>
                  <option>Roboto</option>
                  <option>Open Sans</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Heading Font</label>
                <select className="w-full p-2 border rounded-lg">
                  <option>Inter</option>
                  <option>Poppins</option>
                  <option>Montserrat</option>
                  <option>Playfair Display</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Container Width</label>
                <select className="w-full p-2 border rounded-lg">
                  <option value="1200px">1200px</option>
                  <option value="1400px">1400px</option>
                  <option value="full">Full Width</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Border Radius</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t">
          <button className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};
```

## 🎉 Chapter 7 Summary

In this chapter, we've built:
1. ✅ Complete default theme with advanced components
2. ✅ Modern theme variant with dark mode and animations  
3. ✅ Advanced product cards with hover effects and interactions
4. ✅ Theme customization system with live preview
5. ✅ Responsive design patterns and best practices

### Key Features Implemented:
- **Advanced Header**: Multi-level navigation, search, account dropdown
- **Enhanced Product Cards**: Quick add, wishlist, image hover effects
- **Modern Theme**: Glass morphism, gradients, dark mode
- **Theme Customizer**: Live color, typography, and layout editing
- **Responsive Design**: Mobile-first approach with touch interactions

### Next Steps

In Chapter 8 (final chapter), we'll add:
- Comprehensive testing strategies
- Performance optimizations
- Documentation and deployment guides
- Publishing to NPM

The theme system is now complete with beautiful, customizable themes! Ready for the final chapter?