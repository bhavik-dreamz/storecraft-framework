import React, { useState, useCallback } from 'react'
import { Metadata } from 'next'
import Image from 'next/image'
import { Product, ProductVariant } from '../types'
import { ProductGrid } from '../components/ProductGrid'
import { useCart } from '../providers/CartProvider'

interface ProductPageProps {
  product: Product
  recommendations?: Product[]
  seo?: {
    title?: string
    description?: string
  }
}

// Generate metadata for App Router
export function generateProductMetadata(product: Product, seo: ProductPageProps['seo'] = {}): Metadata {
  const {
    title = `${product.title} | Your Store`,
    description = product.description || `Shop ${product.title} from ${product.vendor}`
  } = seo

  return {
    title,
    description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.images?.map(img => ({ url: img.url, alt: img.altText })) || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description,
    },
    alternates: {
      canonical: `/products/${product.handle}`,
    }
  }
}

export const ProductPage: React.FC<ProductPageProps> = ({ 
  product, 
  recommendations = [],
  seo = {}
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants?.[0] || ({} as ProductVariant)
  )
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  
  const { addItem, isLoading } = useCart()

  const {
    title = `${product.title} | Your Store`,
    description = product.description || `Shop ${product.title} from ${product.vendor}`
  } = seo

  const handleAddToCart = useCallback(async () => {
    if (!selectedVariant?.id) return
    
    try {
      await addItem(selectedVariant.id, quantity)
    } catch (error) {
      console.error('Failed to add item to cart:', error)
    }
  }, [selectedVariant, quantity, addItem])

  const handleVariantChange = useCallback((variant: ProductVariant) => {
    setSelectedVariant(variant)
    // Update selected image if variant has specific image
    if (variant.image && product.images) {
      const imageIndex = product.images.findIndex(img => img.id === variant.image?.id)
      if (imageIndex !== -1) {
        setSelectedImage(imageIndex)
      }
    }
  }, [product.images])

  const currentPrice = selectedVariant?.price?.amount || '0'
  const compareAtPrice = selectedVariant?.compareAtPrice?.amount
  const isOnSale = compareAtPrice && parseFloat(compareAtPrice) > parseFloat(currentPrice)

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                {product.images && product.images[selectedImage] ? (
                  <Image
                    src={product.images[selectedImage].url}
                    alt={product.images[selectedImage].altText || product.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-lg">No Image</span>
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 relative rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? 'border-blue-600' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.altText || `${product.title} view ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                <p className="text-gray-600 mb-2">{product.vendor}</p>
                
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-2xl font-bold">
                    ${currentPrice} {selectedVariant?.price?.currencyCode}
                  </span>
                  {isOnSale && (
                    <span className="text-lg text-gray-500 line-through">
                      ${compareAtPrice}
                    </span>
                  )}
                  {isOnSale && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                      Sale
                    </span>
                  )}
                </div>

                {product.description && (
                  <div 
                    className="text-gray-600 mb-6 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }}
                  />
                )}
              </div>

              {/* Variant Selection */}
              {product.options && product.options.length > 0 && (
                <div className="space-y-4">
                  {product.options.map((option) => (
                    <div key={option.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {option.name}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => {
                          const variant = product.variants?.find(v => 
                            v.selectedOptions.some(so => so.name === option.name && so.value === value)
                          )
                          const isSelected = selectedVariant?.selectedOptions.some(
                            so => so.name === option.name && so.value === value
                          )
                          const isAvailable = variant?.availableForSale

                          return (
                            <button
                              key={value}
                              onClick={() => variant && handleVariantChange(variant)}
                              disabled={!isAvailable}
                              className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                                isSelected 
                                  ? 'border-blue-600 bg-blue-50 text-blue-600' 
                                  : isAvailable
                                  ? 'border-gray-300 text-gray-700 hover:border-gray-400'
                                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              {value}
                              {!isAvailable && ' (Sold out)'}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 h-10 border border-gray-300 rounded-md text-center"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!product.availableForSale || !selectedVariant?.availableForSale || isLoading}
                  className={`w-full py-3 px-6 rounded-md font-medium transition-colors ${
                    product.availableForSale && selectedVariant?.availableForSale && !isLoading
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading 
                    ? 'Adding to Cart...' 
                    : !product.availableForSale || !selectedVariant?.availableForSale
                    ? 'Sold Out'
                    : `Add to Cart - $${currentPrice}`
                  }
                </button>
              </div>

              {/* Product Details */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Product Details</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex">
                    <dt className="font-medium text-gray-900 w-24">Vendor:</dt>
                    <dd className="text-gray-600">{product.vendor}</dd>
                  </div>
                  <div className="flex">
                    <dt className="font-medium text-gray-900 w-24">Type:</dt>
                    <dd className="text-gray-600">{product.productType}</dd>
                  </div>
                  {selectedVariant?.sku && (
                    <div className="flex">
                      <dt className="font-medium text-gray-900 w-24">SKU:</dt>
                      <dd className="text-gray-600">{selectedVariant.sku}</dd>
                    </div>
                  )}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex">
                      <dt className="font-medium text-gray-900 w-24">Tags:</dt>
                      <dd className="text-gray-600">{product.tags.join(', ')}</dd>
                    </div>
                  )}
                </dl>
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
                name: product.vendor
              },
              offers: {
                '@type': 'Offer',
                priceCurrency: selectedVariant?.price?.currencyCode || 'USD',
                price: currentPrice,
                availability: product.availableForSale ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                seller: {
                  '@type': 'Organization',
                  name: product.vendor
                }
              }
            })
          }}
        />
      </div>
    </div>
  )
}