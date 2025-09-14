import React from 'react'
import { Product } from '../types/shopify'
import { useCart } from '../providers'
import { clsx } from 'clsx'

interface ProductCardProps {
  product: Product
  showQuickAdd?: boolean
  showWishlist?: boolean
  className?: string
}

export function ProductCard({
  product,
  showQuickAdd = false,
  showWishlist = false,
  className,
}: ProductCardProps) {
  const { addItem, isLoading } = useCart()

  const handleQuickAdd = async () => {
    if (product.variants.length > 0) {
      await addItem(product.variants[0].id, 1)
    }
  }

  const formatPrice = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(parseFloat(amount))
  }

  const calculateDiscount = (price: string, compareAtPrice?: string) => {
    if (!compareAtPrice) return null
    
    const currentPrice = parseFloat(price)
    const originalPrice = parseFloat(compareAtPrice)
    const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    
    return discountPercent > 0 ? discountPercent : null
  }

  const mainImage = product.images[0]
  const variant = product.variants[0]
  const discount = calculateDiscount(
    variant?.price.amount || product.priceRange.minVariantPrice.amount,
    variant?.compareAtPrice?.amount
  )

  return (
    <div className={clsx('product-card group', className)}>
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        {mainImage && (
          <img
            src={mainImage.url}
            alt={mainImage.altText || product.title}
            className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
            loading="lazy"
          />
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {!product.availableForSale && (
            <span className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white">
              Sold Out
            </span>
          )}
          {discount && (
            <span className="rounded bg-green-500 px-2 py-1 text-xs font-medium text-white">
              -{discount}%
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {showWishlist && (
            <button
              type="button"
              className="rounded-full bg-white p-2 text-gray-400 shadow-md hover:text-red-500"
              aria-label="Add to wishlist"
            >
              <HeartIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Quick Add */}
        {showQuickAdd && product.availableForSale && (
          <div className="absolute inset-x-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isLoading}
              className="w-full rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Quick Add'}
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mt-4 space-y-2">
        {/* Vendor */}
        {product.vendor && (
          <p className="text-sm text-gray-500">{product.vendor}</p>
        )}

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          <a href={`/products/${product.handle}`} className="hover:text-gray-600">
            {product.title}
          </a>
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">
            {formatPrice(
              variant?.price.amount || product.priceRange.minVariantPrice.amount,
              variant?.price.currencyCode || product.priceRange.minVariantPrice.currencyCode
            )}
          </span>
          
          {variant?.compareAtPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(variant.compareAtPrice.amount, variant.compareAtPrice.currencyCode)}
            </span>
          )}
        </div>

        {/* Variant Options Preview */}
        {product.options.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.options[0].values.slice(0, 4).map((value, index) => (
              <span
                key={value}
                className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
              >
                {value}
              </span>
            ))}
            {product.options[0].values.length > 4 && (
              <span className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                +{product.options[0].values.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Simple Heart Icon component
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  )
}

// Utility for line clamping
const lineClampStyles = `
  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
`

// Inject styles if in browser
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = lineClampStyles
  document.head.appendChild(style)
}