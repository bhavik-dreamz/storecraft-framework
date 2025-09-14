import React, { useState } from 'react'
import { Metadata } from 'next'
import { Product, ProductVariant } from '../types'
import { ProductGrid } from '../components/ProductGrid'
import { useCart } from '../providers'
import { formatPrice } from '../utils/formatters'
import { cn } from '../utils/cn'

interface ProductDetailPageProps {
  product: Product
  relatedProducts?: Product[]
  params: {
    handle: string
  }
  searchParams?: {
    variant?: string
  }
}

// Generate metadata for dynamic product pages
export function generateProductMetadata(
  product: Product, 
  selectedVariant?: ProductVariant
): Metadata {
  const variant = selectedVariant || product.variants[0]
  const price = variant?.price ? formatPrice(variant.price) : ''
  
  return {
    title: `${product.title}${price ? ` - ${price}` : ''} | Your Store`,
    description: product.description || `Shop ${product.title} at the best price`,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.images?.map(image => ({
        url: image.url,
        alt: image.altText || product.title,
        width: image.width,
        height: image.height
      })) || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description,
    },
    alternates: {
      canonical: `/products/${product.handle}`,
    },
    other: {
      'product:price:amount': variant?.price?.amount || '',
      'product:price:currency': variant?.price?.currencyCode || 'USD',
    }
  }
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  relatedProducts = [],
  params,
  searchParams
}) => {
  const { addItem, isLoading } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(() => {
    if (searchParams?.variant) {
      return product.variants.find(v => v.id === searchParams.variant) || product.variants[0]
    }
    return product.variants[0]
  })
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = async () => {
    if (!selectedVariant) return
    await addItem(selectedVariant.id, quantity)
  }

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant)
    // Update URL without reload
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('variant', variant.id)
      window.history.replaceState({}, '', url.toString())
    }
  }

  const isOnSale = selectedVariant?.compareAtPrice && 
    parseFloat(selectedVariant.compareAtPrice.amount) > parseFloat(selectedVariant.price?.amount || '0')

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <a href="/" className="hover:text-gray-900">Home</a>
          <span>/</span>
          <a href="/products" className="hover:text-gray-900">Products</a>
          <span>/</span>
          <span className="text-gray-900">{product.title}</span>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImageIndex]?.url}
                  alt={product.images[selectedImageIndex]?.altText || product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image Available
                </div>
              )}
              
              {isOnSale && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Sale
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2",
                      selectedImageIndex === index 
                        ? "border-blue-500" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <img
                      src={image.url}
                      alt={image.altText || `${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              {product.vendor && (
                <p className="text-sm text-gray-500 mb-4">by {product.vendor}</p>
              )}
              
              {/* Price */}
              <div className="flex items-center space-x-2 mb-4">
                {selectedVariant?.price && (
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(selectedVariant.price)}
                  </span>
                )}
                {isOnSale && selectedVariant?.compareAtPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(selectedVariant.compareAtPrice)}
                  </span>
                )}
              </div>

              {/* Availability */}
              <div className="flex items-center space-x-2 mb-6">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  product.availableForSale ? "bg-green-500" : "bg-red-500"
                )}>
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  product.availableForSale ? "text-green-700" : "text-red-700"
                )}>
                  {product.availableForSale ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }} />
              </div>
            )}

            {/* Variant Options */}
            {product.variants.length > 1 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Options</h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantChange(variant)}
                      disabled={!variant.availableForSale}
                      className={cn(
                        "px-4 py-2 border rounded-lg text-sm font-medium transition-colors",
                        selectedVariant?.id === variant.id
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 text-gray-700 hover:border-gray-400",
                        !variant.availableForSale && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {variant.title}
                      {variant.price && (
                        <span className="block text-xs text-gray-500">
                          {formatPrice(variant.price)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                  Quantity:
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.availableForSale || !selectedVariant?.availableForSale || isLoading}
                className={cn(
                  "w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors",
                  product.availableForSale && selectedVariant?.availableForSale
                    ? "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                    : "bg-gray-400 cursor-not-allowed"
                )}
              >
                {isLoading ? "Adding..." : "Add to Cart"}
              </button>
            </div>

            {/* Product Details */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-medium text-gray-900">Product Details</h3>
              <dl className="grid grid-cols-1 gap-2 text-sm">
                {product.vendor && (
                  <>
                    <dt className="font-medium text-gray-700">Brand:</dt>
                    <dd className="text-gray-600">{product.vendor}</dd>
                  </>
                )}
                {product.productType && (
                  <>
                    <dt className="font-medium text-gray-700">Type:</dt>
                    <dd className="text-gray-600">{product.productType}</dd>
                  </>
                )}
                {product.tags && product.tags.length > 0 && (
                  <>
                    <dt className="font-medium text-gray-700">Tags:</dt>
                    <dd className="text-gray-600">{product.tags.join(', ')}</dd>
                  </>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="border-t pt-16">
            <h2 className="text-2xl font-bold text-center mb-8">You Might Also Like</h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.title,
            description: product.description,
            image: product.images?.map(img => img.url) || [],
            brand: {
              '@type': 'Brand',
              name: product.vendor || 'Your Store'
            },
            offers: {
              '@type': 'Offer',
              price: selectedVariant?.price?.amount || '0',
              priceCurrency: selectedVariant?.price?.currencyCode || 'USD',
              availability: product.availableForSale 
                ? 'https://schema.org/InStock' 
                : 'https://schema.org/OutOfStock',
              url: typeof window !== 'undefined' ? window.location.href : '',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '5',
              reviewCount: '1'
            }
          })
        }}
      />
    </div>
  )
}