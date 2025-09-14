import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '../types'

interface ProductGridProps {
  products: Product[]
  columns?: 2 | 3 | 4
  className?: string
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  columns = 4,
  className = '' 
}) => {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found</p>
      </div>
    )
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.handle}`}
          className="group block"
        >
          <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-square relative bg-gray-100">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0].url}
                  alt={product.images[0].altText || product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
              
              {!product.availableForSale && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-semibold">Sold Out</span>
                </div>
              )}

              {/* Badge for sale items */}
              {product.variants && product.variants.length > 0 && 
               product.variants[0].compareAtPrice && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                  Sale
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                {product.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{product.vendor}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {product.variants && product.variants.length > 0 && (
                    <>
                      <span className="font-bold">
                        ${product.variants[0].price.amount}
                      </span>
                      {product.variants[0].compareAtPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.variants[0].compareAtPrice.amount}
                        </span>
                      )}
                    </>
                  )}
                </div>
                
                {/* Quick add button */}
                <button 
                  className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white px-3 py-1 rounded text-sm transition-opacity hover:bg-blue-700"
                  onClick={(e) => {
                    e.preventDefault()
                    // TODO: Add to cart functionality
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}