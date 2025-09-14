import { storecraftRouter } from '../../../src/lib/router'

// Example: Adding custom routes to your theme
export function setupCustomRoutes() {
  
  // Add a custom product comparison page
  storecraftRouter.addRoute({
    path: '/compare/[...products]',
    component: () => import('../components/CompareProducts') as any,
    generateMetadata: (params: any) => ({
      title: `Compare Products | Your Store`,
      description: `Compare ${params.products?.length || 0} products side by side`,
    })
  })

  // Add a custom wishlist page
  storecraftRouter.addRoute({
    path: '/wishlist',
    component: () => import('../components/Wishlist') as any,
    requireAuth: true,
    generateMetadata: () => ({
      title: 'My Wishlist | Your Store',
      description: 'Your saved products and favorites',
    })
  })

  // Add a custom collection page with filtering
  storecraftRouter.addRoute({
    path: '/collections/[handle]/filter/[...filters]',
    component: () => import('../components/FilteredCollection') as any,
    generateMetadata: (params: any) => ({
      title: `${params.handle} Collection | Your Store`,
      description: `Browse ${params.handle} collection with custom filters`,
    })
  })

  // Add a custom admin analytics page
  storecraftRouter.addRoute({
    path: '/admin/analytics/[period]',
    component: () => import('../components/AdminAnalytics') as any,
    requireAuth: true,
    adminOnly: true,
    layout: 'admin',
    generateMetadata: (params: any) => ({
      title: `Analytics - ${params.period} | Admin Dashboard`,
      description: 'Store performance analytics and insights',
      robots: 'noindex, nofollow'
    })
  })

  // Add a custom customer service chat page
  storecraftRouter.addRoute({
    path: '/support/chat',
    component: () => import('../components/CustomerChat') as any,
    generateMetadata: () => ({
      title: 'Customer Support | Your Store',
      description: 'Get help from our customer support team',
    })
  })

  // Add a custom blog section
  storecraftRouter.addRoute({
    path: '/blog/[slug]',
    component: () => import('../components/BlogPost') as any,
    generateMetadata: (params: any) => ({
      title: `${params.slug} | Blog`,
      description: 'Read our latest blog posts and updates',
    })
  })
}

// Example: Custom middleware for route protection
export function setupCustomMiddleware() {
  storecraftRouter.addMiddleware(['/admin/*'], (request, response) => {
    // Example: Check if user is in allowed region
    const userRegion = request.headers.get('cf-ipcountry')
    
    if (userRegion && ['CN', 'RU'].includes(userRegion)) {
      return Response.redirect(new URL('/not-available', request.url)) as any
    }
    
    return response // Continue to route
  })

  storecraftRouter.addMiddleware(['/*'], (request, response) => {
    // Example: Maintenance mode check
    const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true'
    const adminPaths = ['/admin']
    
    if (isMaintenanceMode && !adminPaths.some(path => request.url.includes(path))) {
      return Response.redirect(new URL('/maintenance', request.url)) as any
    }
    
    return response
  })
}