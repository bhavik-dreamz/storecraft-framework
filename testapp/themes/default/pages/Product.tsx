import React from 'react';

export interface ProductTemplateProps {
  product: {
    id: string;
    title: string;
    handle: string;
    description?: string;
    descriptionHtml?: string;
    price: {
      amount: string;
      currencyCode: string;
    };
    images?: Array<{
      url: string;
      altText?: string;
      width?: number;
      height?: number;
    }>;
    variants?: Array<{
      id: string;
      title: string;
      price: {
        amount: string;
        currencyCode: string;
      };
      availableForSale: boolean;
    }>;
  };
}

export default function Product({ product }: ProductTemplateProps) {
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
        {/* Product Image */}
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          {mainImage ? (
            <img 
              src={mainImage.url} 
              alt={mainImage.altText || product.title} 
              className="w-full h-auto object-cover"
            />
          ) : (
            <div className="w-full h-96 flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          
          <div className="mt-4 text-2xl font-semibold">
            {parseFloat(product.price.amount).toLocaleString('en-US', {
              style: 'currency',
              currency: product.price.currencyCode
            })}
          </div>
          
          <div className="mt-6">
            <button className="bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 transition">
              Add to Cart
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
        </div>
      </div>
    </div>
  );
}
