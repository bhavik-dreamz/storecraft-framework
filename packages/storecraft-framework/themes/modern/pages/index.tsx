'use client';

import React from 'react';
import type { Product, Collection } from 'storecraft-framework';
import { ProductGrid } from '../../default/components/ProductGrid';
import { CollectionGrid } from '../../default/components/CollectionGrid';

interface ModernHomePageProps {
  featuredProducts: Product[];
  featuredCollections: Collection[];
}

export default function ModernHomePage({ featuredProducts, featuredCollections }: ModernHomePageProps) {
  return (
    <div className="modern-home">
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-blue-900/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-20" />
        <div className="relative z-20 text-center text-white max-w-4xl px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">The Future of Shopping</h1>
          <p className="text-lg md:text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Experience next-generation e-commerce with cutting-edge design and seamless interactions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/collections/all" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all">Explore Collection</a>
            <a href="#" className="px-8 py-4 border-2 border-white/30 backdrop-blur-sm rounded-full font-semibold text-lg hover:bg-white/10 transition-all">Watch Demo</a>
          </div>
        </div>
      </section>

      {featuredCollections?.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4 text-white">Discover Collections</h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">Curated selections of premium products designed for the modern lifestyle</p>
            <CollectionGrid collections={featuredCollections} />
          </div>
        </section>
      )}

      {featuredProducts?.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="backdrop-blur-lg bg-white/5 rounded-3xl p-8 border border-white/10">
              <h2 className="text-3xl font-bold text-center mb-4 text-white">Featured Products</h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">Hand-picked items that define excellence and innovation</p>
              <ProductGrid products={featuredProducts} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}


