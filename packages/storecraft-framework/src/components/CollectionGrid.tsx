import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Collection } from '../types'

interface CollectionGridProps {
  collections: Collection[]
  columns?: 2 | 3 | 4
  className?: string
}

export const CollectionGrid: React.FC<CollectionGridProps> = ({ 
  collections, 
  columns = 3,
  className = '' 
}) => {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No collections found</p>
      </div>
    )
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {collections.map((collection) => (
        <Link
          key={collection.id}
          href={`/collections/${collection.handle}`}
          className="group block"
        >
          <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-[4/3] relative bg-gray-100">
              {collection.image ? (
                <Image
                  src={collection.image.url}
                  alt={collection.image.altText || collection.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="text-gray-400 text-lg">{collection.title}</span>
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300" />
              
              {/* Title overlay */}
              <div className="absolute inset-0 flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-200 transition-colors">
                    {collection.title}
                  </h3>
                  {collection.description && (
                    <p className="text-sm text-gray-200 line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Alternative layout without overlay */}
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {collection.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Shop Collection
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}