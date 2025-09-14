# StoreCraft Framework Theme Setup Guide

This guide shows you how to set up your StoreCraft Framework with themes to test product pages, order detail pages, and custom routing.

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd test-app
npm install
```

### 2. Configure Environment

Create `.env.local` file in your test-app:

```env
# Shopify Store Configuration
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token
SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_access_token

# Framework Configuration
STORECRAFT_THEME=test-theme
NODE_ENV=development
```

### 3. Run the Development Server

```bash
npm run dev
```

Your app will be available at `http://localhost:3000`

## 🎨 Theme Structure

```
themes/
  test-theme/
    ├── theme.json          # Theme configuration
    ├── components/         # Theme-specific components
    │   ├── ProductDetailPage.tsx
    │   ├── AdminOrderDetail.tsx
    │   └── index.ts
    └── routing/           # Custom routing logic
        └── customRoutes.ts
```

## 📄 Testing Pages

### Product Detail Pages
Test dynamic product routing by visiting:
- `http://localhost:3000/products/premium-t-shirt`
- `http://localhost:3000/products/classic-jeans`
- `http://localhost:3000/products/winter-jacket`

**Features being tested:**
- ✅ Dynamic [handle] parameter routing
- ✅ SEO metadata generation
- ✅ Theme component override
- ✅ Server-side rendering

### Admin Order Detail Pages
Test admin routing by visiting:
- `http://localhost:3000/admin/orders/12345`
- `http://localhost:3000/admin/orders/67890`
- `http://localhost:3000/admin/orders/ORD-001`

**Features being tested:**
- ✅ Dynamic [orderId] parameter routing
- ✅ Admin layout application
- ✅ Authentication requirements
- ✅ Theme customization

### Other Test Pages
- `http://localhost:3000/admin` - Admin Dashboard
- `http://localhost:3000/login` - Authentication
- `http://localhost:3000/account` - User Account
- `http://localhost:3000/cart` - Shopping Cart

## 🔧 Adding Custom Routes

### Method 1: Using StorecraftRouter in Your Theme

Create a setup file in your theme:

```typescript
// themes/your-theme/routing/setup.ts
import { storecraftRouter } from 'storecraft-framework/lib/router'

export function initializeThemeRoutes() {
  // Add custom product comparison
  storecraftRouter.addRoute({
    path: '/compare/[...products]',
    component: () => import('../components/CompareProducts'),
    generateMetadata: (params: any) => ({
      title: `Compare Products | Your Store`,
      description: `Compare ${params.products?.length} products`
    })
  })

  // Add custom wishlist
  storecraftRouter.addRoute({
    path: '/wishlist',
    component: () => import('../components/Wishlist'),
    requireAuth: true,
    generateMetadata: () => ({
      title: 'My Wishlist | Your Store',
      description: 'Your saved products'
    })
  })
}
```

### Method 2: In Your Next.js App Layout

```typescript
// app/layout.tsx
import { storecraftRouter } from 'storecraft-framework'

// Add routes before rendering
storecraftRouter.addRoute({
  path: '/custom-page',
  component: () => import('./components/CustomPage'),
  generateMetadata: () => ({
    title: 'Custom Page | Your Store',
    description: 'Your custom functionality'
  })
})
```

### Method 3: Create Next.js Pages Directly

```typescript
// app/custom-route/[param]/page.tsx
import { YourCustomComponent } from '../../../components/YourCustomComponent'

export default function CustomRoute({ params }: { params: { param: string } }) {
  return <YourCustomComponent param={params.param} />
}

export async function generateMetadata({ params }: { params: { param: string } }) {
  return {
    title: `${params.param} | Your Store`,
    description: `Custom page for ${params.param}`,
  }
}
```

## 🛡️ Authentication & Authorization

### Protect Routes
```typescript
storecraftRouter.addRoute({
  path: '/private-page',
  component: () => import('./PrivatePage'),
  requireAuth: true, // Requires user login
  generateMetadata: () => ({
    title: 'Private Page',
    robots: 'noindex, nofollow'
  })
})

storecraftRouter.addRoute({
  path: '/admin/special',
  component: () => import('./AdminSpecial'),
  requireAuth: true,
  adminOnly: true, // Requires admin privileges
  layout: 'admin'
})
```

## 🎯 SEO & Metadata

### Automatic SEO Generation
The framework automatically generates:
- Title tags
- Meta descriptions
- Open Graph tags
- Twitter Card tags
- Structured data
- Canonical URLs

### Custom SEO
```typescript
storecraftRouter.addRoute({
  path: '/special-page',
  component: () => import('./SpecialPage'),
  generateMetadata: (params: any) => ({
    title: 'Special Page | Your Store',
    description: 'A very special page with custom SEO',
    openGraph: {
      title: 'Special Page',
      description: 'Custom Open Graph description',
      images: ['/images/special-og.jpg'],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Special Page',
      description: 'Custom Twitter description',
      images: ['/images/special-twitter.jpg']
    },
    robots: 'index, follow',
    canonical: 'https://yourstore.com/special-page'
  })
})
```

## 🔧 Middleware & Route Protection

### Add Custom Middleware
```typescript
// Region-based access control
storecraftRouter.addMiddleware(['/restricted/*'], (request, response) => {
  const userCountry = request.headers.get('cf-ipcountry')
  
  if (userCountry && !['US', 'CA', 'GB'].includes(userCountry)) {
    return Response.redirect(new URL('/not-available', request.url)) as any
  }
  
  return response
})

// Maintenance mode
storecraftRouter.addMiddleware(['/*'], (request, response) => {
  if (process.env.MAINTENANCE_MODE === 'true') {
    const adminPaths = ['/admin']
    if (!adminPaths.some(path => request.url.includes(path))) {
      return Response.redirect(new URL('/maintenance', request.url)) as any
    }
  }
  
  return response
})
```

## 📱 Layout System

### Available Layouts
- `default` - Standard storefront layout
- `admin` - Admin panel layout
- `auth` - Authentication pages layout
- `minimal` - Clean, minimal layout

### Using Layouts
```typescript
storecraftRouter.addRoute({
  path: '/admin/reports',
  component: () => import('./AdminReports'),
  layout: 'admin', // Uses admin layout
  requireAuth: true,
  adminOnly: true
})
```

## 🧪 Testing Your Setup

### 1. Check Route Registration
```typescript
// In browser console or component
import { storecraftRouter } from 'storecraft-framework'

console.log('All routes:', storecraftRouter.getRoutes())
console.log('Specific route:', storecraftRouter.getRoute('/products/test-product'))
```

### 2. Test Dynamic Parameters
```typescript
// In your component
export default function TestPage({ params }: { params: { handle: string } }) {
  console.log('Received handle parameter:', params.handle)
  return <div>Testing handle: {params.handle}</div>
}
```

### 3. Verify SEO
View page source or use browser dev tools to check:
- Meta tags are generated
- Open Graph tags are present
- Structured data is included
- Title is dynamic based on parameters

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
Make sure to set these in your production environment:
```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token
SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_token
STORECRAFT_THEME=your-theme-name
```

## 📋 Troubleshooting

### Common Issues

**1. Routes not working**
- Check Next.js file structure matches your routes
- Verify component imports are correct
- Ensure theme components export properly

**2. SEO metadata not showing**
- Check `generateMetadata` function returns correct format
- Verify Next.js metadata API usage
- Test with different browsers/tools

**3. Theme components not loading**
- Check import paths in theme components
- Verify theme.json configuration
- Test component exports

**4. Authentication not working**
- Check auth provider setup
- Verify token configuration
- Test middleware implementation

### Debug Mode
Add this to your layout to see routing debug info:

```typescript
{process.env.NODE_ENV === 'development' && (
  <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs">
    Debug: Current theme active
  </div>
)}
```

## 🎉 Success!

If everything is working, you should see:
- ✅ Product pages loading with dynamic handles
- ✅ Admin pages working with authentication
- ✅ Theme customization applied
- ✅ SEO metadata generated
- ✅ Custom routes accessible
- ✅ Responsive design working

Your StoreCraft Framework is now ready for production use with full theming support!