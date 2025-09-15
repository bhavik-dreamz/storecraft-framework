import React from 'react';

// This is a full route override that handles both data fetching and rendering
export default async function ProductPage({ params }: { params: { handle: string } }) {
  // In a real implementation, the framework would provide access to shopify APIs
  // For this example, we'll create mock product data
  const product = {
    id: '123',
    title: 'Example Product',
    handle: params.handle,
    description: 'This is a mock product for demonstration purposes.',
    descriptionHtml: '<p>This is a <strong>mock product</strong> for demonstration purposes.</p>',
    price: {
      amount: '29.99',
      currencyCode: 'USD'
    },
    images: [
      {
        url: 'https://via.placeholder.com/800x600',
        altText: 'Example product image'
      }
    ],
    variants: [
      {
        id: 'variant-1',
        title: 'Default Variant',
        sku: 'SKU123',
        availableForSale: true,
        price: {
          amount: '29.99',
          currencyCode: 'USD'
        }
      }
    ]
  };
  
  if (!product) {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold">Product not found</h1>
      </div>
    );
  }

  const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Custom Product Page Layout */}
        <div className="bg-gray-50 rounded-lg p-6">
          {mainImage ? (
            <img 
              src={mainImage.url} 
              alt={mainImage.altText || product.title} 
              className="w-full h-auto object-cover rounded"
            />
          ) : (
            <div className="w-full h-96 flex items-center justify-center bg-gray-200 rounded">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          
          <div className="mt-4 text-2xl font-semibold text-blue-600">
            {parseFloat(product.price.amount).toLocaleString('en-US', {
              style: 'currency',
              currency: product.price.currencyCode
            })}
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition">
              Add to Cart
            </button>
            <button className="border border-gray-300 py-3 px-6 rounded-md hover:bg-gray-50 transition">
              Save for Later
            </button>
          </div>
          
          {/* Product Description */}
          <div className="mt-8 prose">
            {product.descriptionHtml ? (
              <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
            ) : (
              <p>{product.description || 'No description available'}</p>
            )}
          </div>
          
          {/* Product Metadata - Custom to this theme route */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-medium">Product Details</h2>
            <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-gray-500">SKU</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {product.variants?.[0]?.sku || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Availability</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {product.variants?.[0]?.availableForSale ? 'In stock' : 'Out of stock'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
