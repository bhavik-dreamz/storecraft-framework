import React, { useState, useMemo } from 'react'
import { Metadata } from 'next'
import { Collection, Product } from '../types'
import { ProductGrid } from '../components/ProductGrid'

interface CollectionPageProps {
  collection: Collection
  products: Product[]
  pagination?: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    startCursor?: string
    endCursor?: string
  }
  seo?: {
    title?: string
    description?: string
  }
}

// Generate metadata for App Router
export function generateCollectionMetadata(collection: Collection, seo: CollectionPageProps['seo'] = {}): Metadata {
  const {
    title = `${collection.title} | Your Store`,
    description = collection.description || `Shop ${collection.title} collection`
  } = seo

  return {
    title,
    description,
    openGraph: {
      title: collection.title,
      description: collection.description,
      images: collection.image ? [{ url: collection.image.url, alt: collection.image.altText }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: collection.title,
      description: collection.description,
    },
    alternates: {
      canonical: `/collections/${collection.handle}`,
    }
  }
}

type SortOption = 'BEST_SELLING' | 'PRICE_LOW_TO_HIGH' | 'PRICE_HIGH_TO_LOW' | 'NEWEST' | 'OLDEST' | 'ALPHABETICAL' | 'REVERSE_ALPHABETICAL'

export const CollectionPage: React.FC<CollectionPageProps> = ({
  collection,
  products,
  pagination = { hasNextPage: false, hasPreviousPage: false },
  seo = {}
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('BEST_SELLING')
  const [filters, setFilters] = useState({
    priceRange: [0, 1000] as [number, number],
    vendor: '',
    productType: '',
    available: true,
    onSale: false
  })

  const {
    title = `${collection.title} | Your Store`,
    description = collection.description || `Shop ${collection.title} collection`
  } = seo

  // Get unique filter options from products
  const filterOptions = useMemo(() => {
    const vendors = [...new Set(products.map(p => p.vendor))].filter(Boolean)
    const productTypes = [...new Set(products.map(p => p.productType))].filter(Boolean)
    const maxPrice = Math.max(...products.map(p => {
      const price = p.variants?.[0]?.price?.amount
      return price ? parseFloat(price) : 0
    }))
    
    return { vendors, productTypes, maxPrice: Math.ceil(maxPrice) }
  }, [products])

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Availability filter
      if (filters.available && !product.availableForSale) return false
      
      // Price range filter
      const price = product.variants?.[0]?.price?.amount
      if (price) {
        const numPrice = parseFloat(price)
        if (numPrice < filters.priceRange[0] || numPrice > filters.priceRange[1]) return false
      }
      
      // Vendor filter
      if (filters.vendor && product.vendor !== filters.vendor) return false
      
      // Product type filter
      if (filters.productType && product.productType !== filters.productType) return false
      
      // On sale filter
      if (filters.onSale) {
        const variant = product.variants?.[0]
        if (!variant?.compareAtPrice || !variant?.price) return false
        if (parseFloat(variant.compareAtPrice.amount) <= parseFloat(variant.price.amount)) return false
      }
      
      return true
    })

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'PRICE_LOW_TO_HIGH':
          const priceA = parseFloat(a.variants?.[0]?.price?.amount || '0')
          const priceB = parseFloat(b.variants?.[0]?.price?.amount || '0')
          return priceA - priceB
        case 'PRICE_HIGH_TO_LOW':
          const priceA2 = parseFloat(a.variants?.[0]?.price?.amount || '0')
          const priceB2 = parseFloat(b.variants?.[0]?.price?.amount || '0')
          return priceB2 - priceA2
        case 'ALPHABETICAL':
          return a.title.localeCompare(b.title)
        case 'REVERSE_ALPHABETICAL':
          return b.title.localeCompare(a.title)
        case 'NEWEST':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        case 'OLDEST':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        default: // BEST_SELLING
          return 0 // Keep original order
      }
    })

    return filtered
  }, [products, filters, sortBy])

  const handlePriceRangeChange = (newRange: [number, number]) => {
    setFilters(prev => ({ ...prev, priceRange: newRange }))
  }

  return (
    <div className="min-h-screen">
      {/* Collection Header */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            {collection.image && (
              <div className="w-full md:w-1/3 lg:w-1/4">
                <div className="aspect-square relative rounded-lg overflow-hidden">
                  <img
                    src={collection.image.url}
                    alt={collection.image.altText || collection.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4">{collection.title}</h1>
              {collection.description && (
                <div 
                  className="text-lg text-gray-600 prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: collection.descriptionHtml || collection.description }}
                />
              )}
              <p className="text-sm text-gray-500 mt-4">
                {filteredAndSortedProducts.length} products
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <aside className="lg:w-64 space-y-6">
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Sort By</h3>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <h3 className="font-semibold mb-3 text-gray-900">Price Range</h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={filterOptions.maxPrice}
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceRangeChange([filters.priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${filters.priceRange[0]}</span>
                  <span>${filters.priceRange[1]}</span>
                </div>
              </div>
            </div>

            {filterOptions.vendors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-gray-900">Brand</h3>
                <select
                  value={filters.vendor}
                  onChange={(e) => setFilters(prev => ({ ...prev, vendor: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Brands</option>
                  {filterOptions.vendors.map(vendor => (
                    <option key={vendor} value={vendor}>{vendor}</option>
                  ))}
                </select>
              </div>
            )}

            {filterOptions.productTypes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-gray-900">Product Type</h3>
                <select
                  value={filters.productType}
                  onChange={(e) => setFilters(prev => ({ ...prev, productType: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  {filterOptions.productTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.available}
                  onChange={(e) => setFilters(prev => ({ ...prev, available: e.target.checked }))}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">In Stock Only</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.onSale}
                  onChange={(e) => setFilters(prev => ({ ...prev, onSale: e.target.checked }))}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">On Sale</span>
              </label>
            </div>

            {/* Clear filters */}
            <button
              onClick={() => setFilters({
                priceRange: [0, filterOptions.maxPrice],
                vendor: '',
                productType: '',
                available: true,
                onSale: false
              })}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear all filters
            </button>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                {filteredAndSortedProducts.length} of {products.length} products
              </p>
            </div>

            {filteredAndSortedProducts.length > 0 ? (
              <ProductGrid products={filteredAndSortedProducts} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products match your current filters</p>
                <button
                  onClick={() => setFilters({
                    priceRange: [0, filterOptions.maxPrice],
                    vendor: '',
                    productType: '',
                    available: true,
                    onSale: false
                  })}
                  className="mt-4 text-blue-600 hover:text-blue-800 underline"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {(pagination.hasNextPage || pagination.hasPreviousPage) && (
              <div className="mt-12 flex justify-center space-x-4">
                {pagination.hasPreviousPage && (
                  <button className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    Previous
                  </button>
                )}
                {pagination.hasNextPage && (
                  <button className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    Next
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: collection.title,
            description: collection.description,
            url: typeof window !== 'undefined' ? `${window.location.origin}/collections/${collection.handle}` : '',
            image: collection.image?.url
          })
        }}
      />
    </div>
  )
}