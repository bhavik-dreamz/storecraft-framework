import React from 'react'

interface ProductDetailPageProps {
  handle: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ handle }) => {
  return (
    <div className="test-theme-product-detail max-w-6xl mx-auto px-4 py-8">
      {/* Theme-specific header */}
      <div className="bg-blue-50 p-4 mb-6 rounded-lg border border-blue-200">
        <p className="text-blue-800 text-sm font-medium">
          🎨 Test Theme Active - Product Detail Page
        </p>
        <p className="text-blue-600 text-xs mt-1">
          Product Handle: <code className="bg-blue-100 px-2 py-1 rounded">{handle}</code>
        </p>
      </div>
      
      {/* Product loading placeholder */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <div className="text-4xl mb-2">📦</div>
              <p>Product Image</p>
              <p className="text-sm">Loading product: {handle}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Product: {handle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h1>
            <p className="text-2xl font-semibold text-blue-600">$99.99</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex space-x-2">
                {['Red', 'Blue', 'Green'].map(color => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: color.toLowerCase() }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
              </select>
            </div>

            <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
              Add to Cart - Test Theme
            </button>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">
              This is a demo product page in the Test Theme. The actual product data 
              would be loaded from Shopify using the handle: <strong>{handle}</strong>
            </p>
          </div>
        </div>
      </div>
      
      {/* Theme-specific footer for product page */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Theme Features Demo:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>✅ Dynamic product routing working</li>
          <li>✅ SEO meta tags generated</li>
          <li>✅ Cart integration active</li>
          <li>✅ Theme customization applied</li>
          <li>✅ Handle parameter: {handle}</li>
        </ul>
      </div>
    </div>
  )
}