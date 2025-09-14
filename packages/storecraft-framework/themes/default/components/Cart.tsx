import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from 'storecraft-framework'

interface CartProps {
  className?: string
  showShippingCalculator?: boolean
}

export function Cart({ 
  className = '',
  showShippingCalculator = true
}: CartProps) {
  const { cart, isLoading, updateItem, removeItem } = useCart()

  const formatPrice = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(parseFloat(amount))
  }

  if (isLoading) {
    return (
      <div className={`bg-white ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cart...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!cart || !cart.lines || cart.lines.length === 0) {
    return (
      <div className={`bg-white ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some products to get started.</p>
            <Link
              href="/collections/all"
              className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:space-x-12">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h1 className="text-3xl font-semibold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600 mt-1">
                {cart.lines.length} {cart.lines.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>

            <div className="space-y-6">
              {cart.lines.map((line) => (
                <div key={line.id} className="flex items-start space-x-4 py-6 border-b border-gray-200">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <Link href={`/products/${line.merchandise.product.handle}`}>
                      <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                        {line.merchandise.image ? (
                          <Image
                            src={line.merchandise.image.url}
                            alt={line.merchandise.image.altText || line.merchandise.product.title}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          <Link 
                            href={`/products/${line.merchandise.product.handle}`}
                            className="hover:text-gray-700"
                          >
                            {line.merchandise.product.title}
                          </Link>
                        </h3>
                        
                        {/* Variant details */}
                        {line.merchandise.title !== 'Default Title' && (
                          <p className="text-sm text-gray-600 mt-1">
                            {line.merchandise.title}
                          </p>
                        )}

                        {/* Attributes */}
                        {line.attributes && line.attributes.length > 0 && (
                          <div className="mt-2">
                            {line.attributes.map((attr) => (
                              <p key={attr.key} className="text-sm text-gray-600">
                                {attr.key}: {attr.value}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Price */}
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {formatPrice(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({formatPrice(line.cost.amountPerQuantity.amount, line.cost.amountPerQuantity.currencyCode)} each)
                          </span>
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removeItem(line.id)}
                        className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                        aria-label="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Quantity selector */}
                    <div className="mt-4 flex items-center">
                      <label className="text-sm text-gray-600 mr-4">Quantity:</label>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          onClick={() => updateItem(line.id, Math.max(0, line.quantity - 1))}
                          className="p-2 hover:bg-gray-50 text-gray-600"
                          disabled={line.quantity <= 1}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="px-4 py-2 text-gray-900 min-w-[3rem] text-center">
                          {line.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(line.id, line.quantity + 1)}
                          className="p-2 hover:bg-gray-50 text-gray-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3 mt-12 lg:mt-0">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}</span>
                </div>
                
                {cart.cost.totalTaxAmount && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{formatPrice(cart.cost.totalTaxAmount.amount, cart.cost.totalTaxAmount.currencyCode)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="mt-6">
                <a
                  href={cart.checkoutUrl}
                  className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors text-center font-medium block"
                >
                  Proceed to Checkout
                </a>
                
                <Link
                  href="/collections/all"
                  className="w-full text-center text-gray-600 hover:text-gray-900 py-3 px-4 text-sm font-medium block mt-2"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Shipping Calculator */}
              {showShippingCalculator && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Estimate shipping</h3>
                  <form className="space-y-3">
                    <input
                      type="text"
                      placeholder="Country"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        placeholder="State/Province"
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="ZIP/Postal Code"
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Calculate shipping
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}