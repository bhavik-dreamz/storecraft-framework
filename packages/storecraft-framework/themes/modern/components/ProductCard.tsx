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
  const [isHovered, setIsHovered] = React.useState(false)

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
    <div 
      className={`group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <Link href={`/products/${product.handle}`} className="block">
        <div className={`relative bg-gradient-to-br from-purple-900/20 to-blue-900/20 ${imageSizes[imageSize]} overflow-hidden`}>
          {mainImage ? (
            <Image
              src={mainImage.url}
              alt={mainImage.altText || product.title}
              fill
              className={`object-cover transition-all duration-700 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          {/* Sale Badge */}
          {firstVariant?.compareAtPrice && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 text-xs font-medium rounded-full animate-pulse">
              SALE
            </div>
          )}

          {/* Wishlist Button */}
          <button className="absolute top-3 right-3 w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-all duration-300 opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-6">
        <Link href={`/products/${product.handle}`} className="block">
          <h3 className="text-lg font-semibold text-white hover:text-purple-300 mb-2 line-clamp-2 transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Description */}
        {product.description && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {product.description.replace(/<[^>]*>/g, '')}
          </p>
        )}

        {/* Pricing */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {firstVariant && (
              <>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
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
                  className={`w-4 h-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-600'}`}
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
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm font-medium flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-purple-500/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
          </button>
        )}
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  )
}