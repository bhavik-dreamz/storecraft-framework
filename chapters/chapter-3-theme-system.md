# Chapter 3: Theme System Implementation

## 🎯 Learning Goals
- Understand the theme override mechanism
- Build the theme structure and templates
- Implement route resolution logic
- Create component inheritance system
- Design theme configuration

## 🎨 Theme Architecture Overview

Our theme system works like WordPress themes with a **fallback hierarchy**:

```
User Request → Theme Check → Framework Fallback

/products/[handle] 
├── themes/active-theme/pages/products/[handle].tsx  ✅ (if exists)
└── framework/core/routes/ProductPage.tsx            ⬅️ (fallback)

/components/Header
├── themes/active-theme/components/Header.tsx        ✅ (if exists)  
└── framework/core/components/Header.tsx             ⬅️ (fallback)
```

## 🏗 Theme Structure

### Standard Theme Directory Structure

Each theme follows this structure:

```
themes/
├── default/
│   ├── theme.config.json        # Theme metadata
│   ├── styles/
│   │   ├── globals.css         # Theme-specific styles
│   │   └── components.css      # Component styles
│   ├── pages/                  # Page overrides
│   │   ├── index.tsx           # Home page
│   │   ├── products/
│   │   │   └── [handle].tsx    # Product page
│   │   ├── collections/
│   │   │   └── [handle].tsx    # Collection page
│   │   └── cart.tsx            # Cart page
│   ├── components/             # Component overrides
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   └── Layout.tsx
│   ├── layouts/                # Layout templates
│   │   ├── DefaultLayout.tsx
│   │   ├── ProductLayout.tsx
│   │   └── CheckoutLayout.tsx
│   └── public/                 # Theme assets
│       ├── images/
│       └── icons/
└── modern/
    └── ... (same structure)
```

## 🔧 Theme Configuration System

### Theme Config Schema

Create `src/lib/theme/types.ts`:

```typescript
export interface ThemeConfig {
  name: string;
  version: string;
  description: string;
  author: {
    name: string;
    email: string;
    url?: string;
  };
  preview?: {
    thumbnail: string;
    demo?: string;
  };
  settings?: {
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
    };
    typography?: {
      fontFamily: string;
      headingFont?: string;
    };
    layout?: {
      containerWidth: string;
      borderRadius: string;
    };
  };
  features?: string[];
  dependencies?: Record<string, string>;
}

export interface ThemeManifest {
  pages: string[];
  components: string[];
  layouts: string[];
  styles: string[];
  assets: string[];
}

export interface ResolvedTheme {
  config: ThemeConfig;
  manifest: ThemeManifest;
  path: string;
}
```

### Theme Resolver

Create `src/lib/theme/resolver.ts`:

```typescript
import fs from 'fs';
import path from 'path';
import { ThemeConfig, ThemeManifest, ResolvedTheme } from './types';

export class ThemeResolver {
  private themesPath: string;
  private activeTheme: string;
  private frameworkPath: string;

  constructor(themesPath: string, activeTheme: string, frameworkPath: string) {
    this.themesPath = themesPath;
    this.activeTheme = activeTheme;
    this.frameworkPath = frameworkPath;
  }

  /**
   * Load theme configuration
   */
  async loadThemeConfig(): Promise<ThemeConfig> {
    const configPath = path.join(this.themesPath, this.activeTheme, 'theme.config.json');
    
    try {
      const configContent = await fs.promises.readFile(configPath, 'utf-8');
      return JSON.parse(configContent) as ThemeConfig;
    } catch (error) {
      console.warn(`Theme config not found for ${this.activeTheme}, using defaults`);
      return this.getDefaultConfig();
    }
  }

  /**
   * Generate theme manifest by scanning directories
   */
  async generateManifest(): Promise<ThemeManifest> {
    const themePath = path.join(this.themesPath, this.activeTheme);
    
    const manifest: ThemeManifest = {
      pages: [],
      components: [],
      layouts: [],
      styles: [],
      assets: []
    };

    // Scan pages directory
    const pagesPath = path.join(themePath, 'pages');
    if (fs.existsSync(pagesPath)) {
      manifest.pages = await this.scanDirectory(pagesPath, ['.tsx', '.ts', '.jsx', '.js']);
    }

    // Scan components directory
    const componentsPath = path.join(themePath, 'components');
    if (fs.existsSync(componentsPath)) {
      manifest.components = await this.scanDirectory(componentsPath, ['.tsx', '.ts', '.jsx', '.js']);
    }

    // Scan layouts directory
    const layoutsPath = path.join(themePath, 'layouts');
    if (fs.existsSync(layoutsPath)) {
      manifest.layouts = await this.scanDirectory(layoutsPath, ['.tsx', '.ts', '.jsx', '.js']);
    }

    // Scan styles directory
    const stylesPath = path.join(themePath, 'styles');
    if (fs.existsSync(stylesPath)) {
      manifest.styles = await this.scanDirectory(stylesPath, ['.css', '.scss', '.sass']);
    }

    // Scan public/assets directory
    const assetsPath = path.join(themePath, 'public');
    if (fs.existsSync(assetsPath)) {
      manifest.assets = await this.scanDirectory(assetsPath, ['.png', '.jpg', '.jpeg', '.svg', '.ico']);
    }

    return manifest;
  }

  /**
   * Resolve a specific route to theme or framework
   */
  resolveRoute(routePath: string): string {
    // Convert route path to file path
    // /products/[handle] → products/[handle].tsx
    const filePath = this.routeToFilePath(routePath);
    
    // Check theme first
    const themeRoutePath = path.join(this.themesPath, this.activeTheme, 'pages', filePath);
    if (fs.existsSync(themeRoutePath)) {
      return themeRoutePath;
    }

    // Fallback to framework
    const frameworkRoutePath = path.join(this.frameworkPath, 'core/routes', filePath);
    if (fs.existsSync(frameworkRoutePath)) {
      return frameworkRoutePath;
    }

    throw new Error(`Route not found: ${routePath}`);
  }

  /**
   * Resolve a component to theme or framework
   */
  resolveComponent(componentName: string): string {
    // Check theme first
    const themeComponentPath = path.join(
      this.themesPath, 
      this.activeTheme, 
      'components', 
      `${componentName}.tsx`
    );
    if (fs.existsSync(themeComponentPath)) {
      return themeComponentPath;
    }

    // Fallback to framework
    const frameworkComponentPath = path.join(
      this.frameworkPath, 
      'core/components', 
      `${componentName}.tsx`
    );
    if (fs.existsExists(frameworkComponentPath)) {
      return frameworkComponentPath;
    }

    throw new Error(`Component not found: ${componentName}`);
  }

  /**
   * Get all available themes
   */
  async getAvailableThemes(): Promise<string[]> {
    try {
      const themes = await fs.promises.readdir(this.themesPath, { withFileTypes: true });
      return themes
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    } catch (error) {
      return [];
    }
  }

  /**
   * Helper: Convert route to file path
   */
  private routeToFilePath(routePath: string): string {
    if (routePath === '/') return 'index.tsx';
    return routePath.slice(1) + '.tsx'; // Remove leading slash and add extension
  }

  /**
   * Helper: Recursively scan directory for files
   */
  private async scanDirectory(dirPath: string, extensions: string[]): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const items = await fs.promises.readdir(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        
        if (item.isDirectory()) {
          const subFiles = await this.scanDirectory(fullPath, extensions);
          files.push(...subFiles.map(f => path.join(item.name, f)));
        } else if (extensions.some(ext => item.name.endsWith(ext))) {
          files.push(item.name);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    
    return files;
  }

  /**
   * Default theme configuration
   */
  private getDefaultConfig(): ThemeConfig {
    return {
      name: this.activeTheme,
      version: '1.0.0',
      description: `Default theme configuration for ${this.activeTheme}`,
      author: {
        name: 'StoreCraft',
        email: 'support@storecraft.com'
      },
      settings: {
        colors: {
          primary: '#3B82F6',
          secondary: '#6B7280',
          accent: '#F59E0B'
        },
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif'
        },
        layout: {
          containerWidth: '1200px',
          borderRadius: '8px'
        }
      }
    };
  }
}
```

## 🚀 Dynamic Route Loading System

### Route Loader

Create `src/lib/theme/route-loader.ts`:

```typescript
import { NextRequest } from 'next/server';
import { ThemeResolver } from './resolver';
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

export class RouteLoader {
  private resolver: ThemeResolver;
  private cache: Map<string, ComponentType> = new Map();

  constructor(resolver: ThemeResolver) {
    this.resolver = resolver;
  }

  /**
   * Load route component with fallback
   */
  async loadRoute(routePath: string): Promise<ComponentType> {
    // Check cache first
    if (this.cache.has(routePath)) {
      return this.cache.get(routePath)!;
    }

    try {
      const resolvedPath = this.resolver.resolveRoute(routePath);
      const RouteComponent = await this.dynamicImport(resolvedPath);
      
      this.cache.set(routePath, RouteComponent);
      return RouteComponent;
    } catch (error) {
      console.error(`Failed to load route: ${routePath}`, error);
      return this.getNotFoundComponent();
    }
  }

  /**
   * Load component with fallback
   */
  async loadComponent(componentName: string): Promise<ComponentType> {
    const cacheKey = `component:${componentName}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const resolvedPath = this.resolver.resolveComponent(componentName);
      const Component = await this.dynamicImport(resolvedPath);
      
      this.cache.set(cacheKey, Component);
      return Component;
    } catch (error) {
      console.error(`Failed to load component: ${componentName}`, error);
      return this.getDefaultComponent(componentName);
    }
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Dynamic import with proper error handling
   */
  private async dynamicImport(modulePath: string): Promise<ComponentType> {
    try {
      const module = await import(modulePath);
      return module.default || module[Object.keys(module)[0]];
    } catch (error) {
      throw new Error(`Failed to import module: ${modulePath}`);
    }
  }

  /**
   * Default 404 component
   */
  private getNotFoundComponent(): ComponentType {
    return () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
          <p className="text-gray-600">The page you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  /**
   * Default component fallback
   */
  private getDefaultComponent(componentName: string): ComponentType {
    return () => (
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-600">Component not found: {componentName}</p>
      </div>
    );
  }
}
```

## 🎨 Theme Template System

### Base Theme Layout

Create a base layout that themes can extend:

`src/lib/theme/BaseLayout.tsx`:

```tsx
'use client';

import React from 'react';
import { useTheme } from '../../providers/ThemeProvider';
import { RouteLoader } from './route-loader';
import { ThemeResolver } from './resolver';

interface BaseLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({ children, className = '' }) => {
  const { activeTheme, themeConfig, storeConfig } = useTheme();

  // Apply theme styles
  React.useEffect(() => {
    if (themeConfig?.settings?.colors) {
      const root = document.documentElement;
      const colors = themeConfig.settings.colors;
      
      root.style.setProperty('--color-primary', colors.primary);
      root.style.setProperty('--color-secondary', colors.secondary);
      root.style.setProperty('--color-accent', colors.accent);
    }
  }, [themeConfig]);

  return (
    <div className={`theme-${activeTheme} ${className}`}>
      <div 
        className="min-h-screen"
        style={{
          fontFamily: themeConfig?.settings?.typography?.fontFamily,
        }}
      >
        {children}
      </div>
    </div>
  );
};
```

### Theme Component Factory

Create `src/lib/theme/component-factory.ts`:

```typescript
import { ComponentType } from 'react';
import { RouteLoader } from './route-loader';

export class ComponentFactory {
  private routeLoader: RouteLoader;

  constructor(routeLoader: RouteLoader) {
    this.routeLoader = routeLoader;
  }

  /**
   * Create a component with theme override capability
   */
  createThemedComponent<T extends {}>(
    componentName: string,
    defaultProps: Partial<T> = {}
  ): ComponentType<T> {
    return (props: T) => {
      const [Component, setComponent] = React.useState<ComponentType<T> | null>(null);
      
      React.useEffect(() => {
        this.routeLoader.loadComponent(componentName).then(setComponent);
      }, [componentName]);

      if (!Component) {
        return <div>Loading {componentName}...</div>;
      }

      return <Component {...defaultProps} {...props} />;
    };
  }

  /**
   * Create a page component with theme override capability
   */
  createThemedPage<T extends {}>(
    routePath: string,
    defaultProps: Partial<T> = {}
  ): ComponentType<T> {
    return (props: T) => {
      const [Page, setPage] = React.useState<ComponentType<T> | null>(null);
      
      React.useEffect(() => {
        this.routeLoader.loadRoute(routePath).then(setPage);
      }, [routePath]);

      if (!Page) {
        return <div>Loading page...</div>;
      }

      return <Page {...defaultProps} {...props} />;
    };
  }
}
```

## 📁 Default Theme Structure

Let's create a complete default theme:

### Theme Configuration

Create `templates/default/theme.config.json`:

```json
{
  "name": "Default",
  "version": "1.0.0",
  "description": "Clean and modern default theme for StoreCraft",
  "author": {
    "name": "StoreCraft Team",
    "email": "themes@storecraft.com",
    "url": "https://storecraft.com"
  },
  "preview": {
    "thumbnail": "/themes/default/preview.jpg"
  },
  "settings": {
    "colors": {
      "primary": "#3B82F6",
      "secondary": "#6B7280",
      "accent": "#F59E0B"
    },
    "typography": {
      "fontFamily": "Inter, system-ui, sans-serif",
      "headingFont": "Inter, system-ui, sans-serif"
    },
    "layout": {
      "containerWidth": "1200px",
      "borderRadius": "8px"
    }
  },
  "features": [
    "responsive-design",
    "dark-mode-ready",
    "accessibility",
    "seo-optimized"
  ]
}
```

### Default Theme Layout

Create `templates/default/components/Layout.tsx`:

```tsx
'use client';

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

### Default Theme Header

Create `templates/default/components/Header.tsx`:

```tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from 'storecraft-framework';
import { ShoppingCart, Menu, X, Search, User } from 'lucide-react';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart } = useCart();

  const totalItems = cart?.totalQuantity || 0;

  const navigation = [
    { name: 'Shop', href: '/collections/all' },
    { name: 'About', href: '/pages/about' },
    { name: 'Contact', href: '/pages/contact' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">StoreCraft</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 text-gray-700 hover:text-primary">
              <Search size={20} />
            </button>

            {/* Account */}
            <Link href="/account" className="p-2 text-gray-700 hover:text-primary">
              <User size={20} />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-primary">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-2 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
```

### Default Theme Home Page

Create `templates/default/pages/index.tsx`:

```tsx
import React from 'react';
import { HomePage as BaseHomePage } from 'storecraft-framework';
import { Product, Collection } from 'storecraft-framework/types';

interface DefaultHomePageProps {
  featuredProducts: Product[];
  featuredCollections: Collection[];
}

export default function DefaultHomePage({ featuredProducts, featuredCollections }: DefaultHomePageProps) {
  return (
    <div className="default-theme">
      {/* Custom Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-24">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Discover Amazing Products
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Curated collection of premium products, handpicked just for you. 
            Experience quality like never before.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              Shop Collection
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Use base functionality with custom styling */}
      <div className="theme-content">
        <BaseHomePage 
          featuredProducts={featuredProducts}
          featuredCollections={featuredCollections}
        />
      </div>

      {/* Additional theme-specific sections */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Shipping</h3>
              <p className="text-gray-600">Free shipping on orders over $50</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🛡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">Your payment information is safe</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">💎</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">Only the best products make it to our store</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

## 🎉 Chapter 3 Summary

In this chapter, we've built:
1. ✅ Complete theme resolver system with fallback logic
2. ✅ Dynamic route and component loading
3. ✅ Theme configuration and manifest system
4. ✅ Base layout and component factory
5. ✅ Complete default theme with overrides

### Next Steps

In Chapter 4, we'll create the Next.js plugin:
- withStorecraft configuration wrapper
- Route merging and build-time optimizations
- Theme loading integration
- Development vs. production handling

The theme system is now fully functional! Ready for Chapter 4?