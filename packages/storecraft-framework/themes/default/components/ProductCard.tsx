import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from 'storecraft-framework/types'
import { useCart } from 'storecraft-framework'

interface ProductCardProps {
  product: Product
  className?: string
  showQuickAdd?: boolean
  imageSize?: 'sm' | 'md' | 'lg'
}

export function ProductCard({ 
  product, 
  className = '',
  showQuickAdd = true,
  imageSize = 'md'
}: ProductCardProps) {
  const { addItem } = useCart()
  const [isAddingToCart, setIsAddingToCart] = React.useState(false)

  const imageSizes = {
    sm: 'h-48',
    md: 'h-64',
    lg: 'h-80'
  }

  const handleQuickAdd = async () => {
    if (!product.variants?.length) return
    
    setIsAddingToCart(true)
    try {
      const firstVariant = product.variants[0]
      await addItem(firstVariant.id, 1)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const formatPrice = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(parseFloat(amount))
  }

  const mainImage = product.images?.[0]
  const firstVariant = product.variants?.[0]
  
  return (
    <div className={`group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 ${className}`}>
      {/* Product Image */}
      <Link href={`/products/${product.handle}`} className="block">
        <div className={`relative bg-gray-100 ${imageSizes[imageSize]} overflow-hidden`}>
          {mainImage ? (
            <Image
              src={mainImage.url}
              alt={mainImage.altText || product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Sale Badge */}
          {firstVariant?.compareAtPrice && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded">
              Sale
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/products/${product.handle}`} className="block">
          <h3 className="text-lg font-medium text-gray-900 hover:text-gray-700 mb-2 line-clamp-2">
            {product.title}
          </h3>
        </Link>

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description.replace(/<[^>]*>/g, '')}
          </p>
        )}

        {/* Pricing */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {firstVariant && (
              <>
                <span className="text-lg font-semibold text-gray-900">
                  {formatPrice(firstVariant.price.amount, firstVariant.price.currencyCode)}
                </span>
                {firstVariant.compareAtPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(firstVariant.compareAtPrice.amount, firstVariant.compareAtPrice.currencyCode)}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Rating/Reviews */}
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500">(24)</span>
          </div>
        </div>

        {/* Quick Add Button */}
        {showQuickAdd && firstVariant && (
          <button
            onClick={handleQuickAdd}
            disabled={isAddingToCart}
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {isAddingToCart ? 'Adding...' : 'Quick Add'}
          </button>
        )}
      </div>
    </div>
  )
}