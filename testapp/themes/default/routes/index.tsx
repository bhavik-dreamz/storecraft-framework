import React from 'react';
import Link from 'next/link';

export default async function HomePage() {
  // In a real implementation, the framework would provide featured products, collections, etc.
  // For this example, we'll create mock data
  
  const featuredCollections = [
    { id: 'col1', title: 'Summer Collection', handle: 'summer', image: 'https://via.placeholder.com/600x400' },
    { id: 'col2', title: 'Winter Essentials', handle: 'winter', image: 'https://via.placeholder.com/600x400' },
    { id: 'col3', title: 'New Arrivals', handle: 'new-arrivals', image: 'https://via.placeholder.com/600x400' }
  ];
  
  const featuredProducts = [
    { id: 'prod1', title: 'Featured Product 1', handle: 'featured-1', price: '29.99', image: 'https://via.placeholder.com/400x400' },
    { id: 'prod2', title: 'Featured Product 2', handle: 'featured-2', price: '39.99', image: 'https://via.placeholder.com/400x400' },
    { id: 'prod3', title: 'Featured Product 3', handle: 'featured-3', price: '49.99', image: 'https://via.placeholder.com/400x400' },
    { id: 'prod4', title: 'Featured Product 4', handle: 'featured-4', price: '59.99', image: 'https://via.placeholder.com/400x400' }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative h-96 mb-16 rounded-lg overflow-hidden">
        <img 
          src="https://via.placeholder.com/1600x800" 
          alt="Hero" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent flex items-center">
          <div className="max-w-xl ml-8 md:ml-16 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to StoreCraft</h1>
            <p className="text-lg mb-6">Your modern Shopify headless storefront</p>
            <Link 
              href="/products" 
              className="inline-block bg-white text-black px-8 py-3 rounded-md font-medium hover:bg-gray-200 transition"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
      
      {/* Featured Collections */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Shop Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCollections.map(collection => (
            <Link 
              href={`/collections/${collection.handle}`} 
              key={collection.id}
              className="block group relative h-64 rounded-lg overflow-hidden"
            >
              <img 
                src={collection.image} 
                alt={collection.title} 
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h3 className="text-xl font-bold text-white">{collection.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Featured Products */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <Link
              href={`/products/${product.handle}`}
              key={product.id}
              className="group block"
            >
              <div className="aspect-w-1 aspect-h-1 w-full rounded-lg overflow-hidden mb-3">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="w-full h-64 object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="font-medium text-lg">{product.title}</h3>
              <p className="mt-1 font-bold">${product.price}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
