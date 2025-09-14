import React from 'react'
import { Metadata } from 'next'
import { Product, Collection } from '../types'
import { ProductGrid } from '../components/ProductGrid'
import { CollectionGrid } from '../components/CollectionGrid'

interface HomePageProps {
  featuredProducts: Product[]
  featuredCollections: Collection[]
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
}

// Generate metadata for App Router
export function generateHomeMetadata(seo: HomePageProps['seo'] = {}): Metadata {
  const {
    title = 'Welcome to Your Store',
    description = 'Discover our amazing collection of products, curated just for you',
    keywords = ['ecommerce', 'shopify', 'online store', 'products']
  } = seo

  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: '/',
    }
  }
}

export const HomePage: React.FC<HomePageProps> = ({ 
  featuredProducts, 
  featuredCollections,
  seo = {}
}) => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to Your Store
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover our amazing collection of products, curated just for you.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Shop Now
          </button>
        </div>
      </section>

      {/* Featured Collections */}
      {featuredCollections.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Shop by Category
            </h2>
            <CollectionGrid collections={featuredCollections} />
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Featured Products
            </h2>
            <ProductGrid products={featuredProducts} />
          </div>
        </section>
      )}

      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: seo.title || 'Welcome to Your Store',
            description: seo.description || 'Discover our amazing collection of products, curated just for you',
            url: typeof window !== 'undefined' ? window.location.origin : '',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${typeof window !== 'undefined' ? window.location.origin : ''}/search?q={search_term_string}`
              },
              'query-input': 'required name=search_term_string'
            }
          })
        }}
      />
    </div>
  )
}