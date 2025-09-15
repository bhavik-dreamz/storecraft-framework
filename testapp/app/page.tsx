'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-16">
      <div className="w-full max-w-5xl px-6">
        <h1 className="text-center text-4xl font-bold tracking-tight sm:text-6xl">
          Welcome to StoreCraft
        </h1>
        <p className="mt-6 text-center text-lg text-gray-600">
          Your modern Shopify headless storefront is ready.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a 
            href="/products" 
            className="rounded-md bg-black px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-gray-800"
          >
            Explore Products
          </a>
        </div>
      </div>
    </div>
  );
}
