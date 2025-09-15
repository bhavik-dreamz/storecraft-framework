'use client';

import React from 'react';
import Link from 'next/link';

export default function ProductsPage() {
  // In a real implementation, this would be fetched from Shopify
  const mockProducts = [
    { id: '1', title: 'Sample Product 1', handle: 'sample-product-1', price: '$19.99' },
    { id: '2', title: 'Sample Product 2', handle: 'sample-product-2', price: '$29.99' },
    { id: '3', title: 'Sample Product 3', handle: 'sample-product-3', price: '$39.99' },
    { id: '4', title: 'Sample Product 4', handle: 'sample-product-4', price: '$49.99' },
  ];
  
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockProducts.map(product => (
          <div key={product.id} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{product.title}</h2>
            <p className="text-gray-600 my-2">{product.price}</p>
            <Link href={`/products/${product.handle}`} className="text-blue-600 hover:underline">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
