import React from 'react';
import Link from 'next/link';

export interface CollectionTemplateProps {
  collection: {
    id: string;
    title: string;
    handle: string;
    description?: string;
    image?: {
      url: string;
      altText?: string;
    };
    products: Array<{
      id: string;
      title: string;
      handle: string;
      description?: string;
      price: {
        amount: string;
        currencyCode: string;
      };
      image?: {
        url: string;
        altText?: string;
      };
    }>;
  };
}

export default function Collection({ collection }: CollectionTemplateProps) {
  if (!collection) {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold">Collection not found</h1>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{collection.title}</h1>
        
        {collection.description && (
          <p className="text-gray-600 max-w-2xl mx-auto">{collection.description}</p>
        )}
      </header>
      
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {collection.products.map(product => (
          <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
            {/* Product Image */}
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100">
              {product.image ? (
                <img
                  src={product.image.url}
                  alt={product.image.altText || product.title}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div className="p-4">
              <h2 className="text-lg font-medium">{product.title}</h2>
              
              <p className="mt-1 text-lg font-semibold">
                {parseFloat(product.price.amount).toLocaleString('en-US', {
                  style: 'currency',
                  currency: product.price.currencyCode
                })}
              </p>
              
              <Link 
                href={`/products/${product.handle}`}
                className="mt-3 inline-block text-sm text-blue-600 hover:underline"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
