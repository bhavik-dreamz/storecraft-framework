# StoreCraft Framework

**StoreCraft Framework** is a modern, theme-based Next.js framework for building high-performance Shopify headless storefronts. Inspired by WordPress theme system, it provides a powerful and flexible architecture for creating custom e-commerce experiences.

## 🚀 Features

- **Theme System**: WordPress-inspired theme override system with fallback hierarchy
- **Next.js 14+**: Built on the latest Next.js with App Router support
- **TypeScript**: Full type safety for better developer experience  
- **Shopify Integration**: Complete Shopify Storefront and Admin API support
- **React Providers**: Built-in cart, auth, and theme management
- **CLI Tool**: Easy project creation and theme management
- **Modern Components**: Pre-built UI components with Tailwind CSS
- **Performance Optimized**: Lazy loading, responsive images, and build-time optimizations

## 📦 Packages

This monorepo contains two main packages:

- **`storecraft-framework`** - Core framework with providers, components, and integrations
- **`create-myshop`** - CLI tool for project scaffolding and theme management

## ✅ Chapter 1 Implementation Status

**Package Configuration**: ✅ Complete
- Package name: `storecraft-framework` (consistent naming)
- Correct dependencies: `graphql-request`, `zustand`, `clsx`, `tailwind-merge`, `class-variance-authority`
- Proper peer dependencies: `next>=13.0.0`, `react>=18.0.0`, `react-dom>=18.0.0`
- Build scripts configured for Rollup

**TypeScript Types**: ✅ Complete
- Comprehensive Shopify types (Product, Collection, Cart, Customer, etc.)
- Framework-specific types (StoreConfig, UseCartReturn, UseAuthReturn, etc.)
- Theme system types (ThemeConfig, StorecraftConfig)
- Hook return types and page props interfaces

**Build Configuration**: ✅ Complete  
- Rollup configuration for CJS and ESM builds
- TypeScript compilation with declaration files
- JSX/TSX support for React components
- Proper external dependency handling

**Framework Structure**: ✅ Complete
- `/src/types/` - All TypeScript definitions
- `/src/providers/` - React context providers  
- `/src/components/` - Core UI components
- `/src/lib/` - Utility functions and integrations
- Main exports configured in `index.ts`

## 🏗️ Architecture

StoreCraft Framework follows a theme-based architecture where components can be overridden at the theme level:

```
your-project/
├── themes/
│   ├── default/
│   │   ├── components/
│   │   │   ├── Header.tsx      # Override Header component
│   │   │   ├── ProductCard.tsx # Override ProductCard component
│   │   │   └── ...
│   │   ├── styles/
│   │   │   └── theme.css
│   │   └── theme.json          # Theme configuration
│   └── custom-theme/
├── src/
│   ├── app/                    # Next.js App Router
│   └── components/             # Custom components
├── next.config.js              # StoreCraft configuration
└── package.json
```

## 🛠️ Quick Start

### 1. Create a New Project

```bash
npx create-myshop@latest my-store
cd my-store
```

### 2. Configure Shopify

Update `.env.local` with your Shopify credentials:

```env
SHOPIFY_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-token
STORECRAFT_ACTIVE_THEME=default
```

### 3. Start Development

```bash
npm install
npm run dev
```

Your store will be available at `http://localhost:3000`

## 🎨 Theme Management

### List Available Themes

```bash
myshop theme list
```

### Switch Themes

```bash
myshop theme switch modern
```

### Install New Themes

```bash
myshop theme install minimal
```

### Create Custom Theme

```bash
myshop theme create my-custom-theme
```

## 🔧 CLI Commands

The StoreCraft CLI (`myshop`) provides several commands:

| Command | Description |
|---------|-------------|
| `myshop create [name]` | Create a new StoreCraft project |
| `myshop dev` | Start development server |
| `myshop build` | Build for production |
| `myshop deploy` | Deploy to hosting platform |
| `myshop theme list` | List available themes |
| `myshop theme switch <theme>` | Switch active theme |
| `myshop theme install <theme>` | Install a new theme |

## 🏗️ Framework Structure

### Core Providers

StoreCraft includes several React providers for state management:

```tsx
import { RootProvider, createStoreCraftConfig } from 'storecraft-framework'

const config = createStoreCraftConfig({
  activeTheme: 'default',
  shopify: {
    domain: process.env.SHOPIFY_DOMAIN!,
    storefrontAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
  },
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RootProvider config={config}>
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
```

### Using Hooks

Access cart, auth, and theme data with built-in hooks:

```tsx
import { useCart, useAuth, useTheme } from 'storecraft-framework'

function MyComponent() {
  const { cart, addItem, removeItem } = useCart()
  const { user, login, logout } = useAuth()
  const { activeTheme, switchTheme } = useTheme()
  
  return (
    // Your component JSX
  )
}
```

### Components

Use pre-built components or override them in your theme:

```tsx
import { Header, Footer, ProductCard, Cart } from 'storecraft-framework'

function HomePage() {
  return (
    <div>
      <Header />
      <main>
        <ProductCard product={product} />
      </main>
      <Footer />
    </div>
  )
}
```

## 🎨 Creating Themes

### Theme Structure

```
themes/my-theme/
├── theme.json          # Theme configuration
├── components/         # Component overrides
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   └── Cart.tsx
└── styles/
    └── theme.css       # Theme styles
```

### Theme Configuration (theme.json)

```json
{
  "name": "my-theme",
  "version": "1.0.0",
  "description": "My custom theme",
  "components": {
    "Header": "./components/Header.tsx",
    "ProductCard": "./components/ProductCard.tsx"
  },
  "styles": {
    "colors": {
      "primary": "#000000",
      "secondary": "#6b7280",
      "accent": "#3b82f6"
    },
    "typography": {
      "fontFamily": "Inter, sans-serif"
    }
  }
}
```

### Component Override

```tsx
// themes/my-theme/components/Header.tsx
import { Header as BaseHeader } from 'storecraft-framework'

export function Header(props) {
  return (
    <BaseHeader 
      {...props}
      className="bg-purple-600 text-white"
      logo={<span>My Store</span>}
    />
  )
}
```

## 🚀 Deployment

StoreCraft supports multiple deployment platforms:

### Vercel

```bash
myshop deploy --platform vercel
```

### Netlify

```bash
myshop deploy --platform netlify
```

### Other Platforms

```bash
myshop deploy --platform manual
```

This will show manual deployment instructions for any platform.

## 📚 API Reference

### Configuration

```tsx
interface StoreCraftConfig {
  activeTheme: string
  shopify: {
    domain: string
    storefrontAccessToken: string
    adminAccessToken?: string
  }
  features?: {
    cart?: boolean
    auth?: boolean
    search?: boolean
    wishlist?: boolean
    reviews?: boolean
  }
}
```

### Hooks

#### useCart()

```tsx
const {
  cart,           // Current cart data
  isLoading,      // Loading state
  addItem,        // Add item to cart
  removeItem,     // Remove item from cart
  updateItem,     // Update item quantity
  clearCart       // Clear entire cart
} = useCart()
```

#### useAuth()

```tsx
const {
  user,           // Current user data
  isLoading,      // Loading state
  login,          // Login function
  logout,         // Logout function
  register        // Register function
} = useAuth()
```

#### useTheme()

```tsx
const {
  activeTheme,    // Current theme name
  themeConfig,    // Theme configuration
  switchTheme,    // Switch to different theme
  getComponent    // Get themed component
} = useTheme()
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Shopify for the powerful APIs
- Tailwind CSS for the utility-first approach
- The open-source community for inspiration

---

**Ready to build your next e-commerce experience?**

```bash
npx create-myshop@latest my-awesome-store
```

For more information, visit [storecraft-framework.com](https://storecraft-framework.com)