import React from 'react';
import Link from 'next/link';

export default async function CollectionPage({ params }: { params: { handle: string } }) {
  // In a real implementation, the framework would provide access to shopify APIs
  // For this example, we'll create mock collection data
  const collection = {
    id: 'col123',
    title: `${params.handle.charAt(0).toUpperCase() + params.handle.slice(1)} Collection`,
    handle: params.handle,
    description: 'This is a mock collection for demonstration purposes.',
    image: {
      url: 'https://via.placeholder.com/1200x400',
      altText: 'Collection banner'
    },
    products: [
      {
        id: 'prod1',
        title: 'Example Product 1',
        handle: 'example-product-1',
        description: 'This is a sample product in the collection.',
        price: {
          amount: '29.99',
          currencyCode: 'USD'
        },
        image: {
          url: 'https://via.placeholder.com/400x400',
          altText: 'Product 1'
        }
      },
      {
        id: 'prod2',
        title: 'Example Product 2',
        handle: 'example-product-2',
        description: 'Another sample product in the collection.',
        price: {
          amount: '39.99',
          currencyCode: 'USD'
        },
        image: {
          url: 'https://via.placeholder.com/400x400',
          altText: 'Product 2'
        }
      },
      {
        id: 'prod3',
        title: 'Example Product 3',
        handle: 'example-product-3',
        description: 'A third sample product in the collection.',
        price: {
          amount: '49.99',
          currencyCode: 'USD'
        },
        image: {
          url: 'https://via.placeholder.com/400x400',
          altText: 'Product 3'
        }
      }
    ]
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Collection Banner */}
      <div className="relative h-64 mb-8 rounded-lg overflow-hidden">
        <img 
          src={collection.image.url}
          alt={collection.image.altText}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">{collection.title}</h1>
        </div>
      </div>
      
      {/* Collection Description */}
      {collection.description && (
        <div className="mb-8 text-center">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{collection.description}</p>
        </div>
      )}
      
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {collection.products.map(product => (
          <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition duration-300">
            <Link href={`/products/${product.handle}`} className="block">
              <div className="aspect-w-1 aspect-h-1">
                <img
                  src={product.image.url}
                  alt={product.image.altText}
                  className="w-full h-64 object-cover"
                />
              </div>
              
              <div className="p-4">
                <h2 className="text-xl font-semibold">{product.title}</h2>
                <p className="mt-2 text-gray-500 line-clamp-2">{product.description}</p>
                <p className="mt-2 text-xl font-bold text-blue-600">
                  {parseFloat(product.price.amount).toLocaleString('en-US', {
                    style: 'currency',
                    currency: product.price.currencyCode
                  })}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
