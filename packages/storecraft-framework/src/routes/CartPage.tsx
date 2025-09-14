import React from 'react'
import { Metadata } from 'next'
import { useCart } from '../providers'
import { formatPrice } from '../utils/formatters'
import { cn } from '../utils/cn'

export const metadata: Metadata = {
  title: 'Shopping Cart | Your Store',
  description: 'Review your items and proceed to checkout',
}

export const CartPage: React.FC = () => {
  const { cart, updateItem, removeItem, isLoading } = useCart()

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <a 
            href="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    )
  }

  const subtotal = cart.lines.reduce((sum, line) => {
    const price = line.merchandise?.price?.amount ? parseFloat(line.merchandise.price.amount) : 0
    return sum + (price * line.quantity)
  }, 0)

  const handleQuantityChange = async (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(lineId)
    } else {
      await updateItem(lineId, quantity)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600">{cart.lines.length} {cart.lines.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.lines.map((line) => (
              <div key={line.id} className="bg-white rounded-lg border p-6">
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 flex-shrink-0">
                    {line.merchandise?.image ? (
                      <img
                        src={line.merchandise.image.url}
                        alt={line.merchandise.image.altText || line.merchandise.product?.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {line.merchandise?.product?.title || 'Product'}
                        </h3>
                        {line.merchandise?.title && line.merchandise.title !== 'Default Title' && (
                          <p className="text-sm text-gray-500">{line.merchandise.title}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(line.id)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        <span className="sr-only">Remove</span>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex justify-between items-end">
                      {/* Quantity Selector */}
                      <div className="flex items-center space-x-2">
                        <label htmlFor={`qty-${line.id}`} className="text-sm text-gray-600">Qty:</label>
                        <select
                          id={`qty-${line.id}`}
                          value={line.quantity}
                          onChange={(e) => handleQuantityChange(line.id, parseInt(e.target.value))}
                          disabled={isLoading}
                          className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                        >
                          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        {line.merchandise?.price && (
                          <div className="text-lg font-medium text-gray-900">
                            {formatPrice(line.merchandise.price)}
                          </div>
                        )}
                        <div className="text-sm text-gray-500">
                          {line.merchandise?.price && (
                            <>
                              {formatPrice(line.merchandise.price)} × {line.quantity}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cart.lines.length} items)</span>
                  <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">Calculated at checkout</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && cart.checkoutUrl) {
                    window.location.href = cart.checkoutUrl
                  }
                }}
                disabled={isLoading || !cart.checkoutUrl}
                className={cn(
                  "w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors mb-4",
                  "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500",
                  (isLoading || !cart.checkoutUrl) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/products'
                  }
                }}
                className="w-full py-2 px-6 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>

              {/* Security Badge */}
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secure checkout</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Your payment information is processed securely
                </p>
              </div>

              {/* Payment Methods */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">We accept</p>
                <div className="flex space-x-2">
                  <div className="w-8 h-5 bg-gray-200 rounded text-xs flex items-center justify-center">💳</div>
                  <div className="w-8 h-5 bg-gray-200 rounded text-xs flex items-center justify-center">💳</div>
                  <div className="w-8 h-5 bg-gray-200 rounded text-xs flex items-center justify-center">💳</div>
                  <div className="w-8 h-5 bg-gray-200 rounded text-xs flex items-center justify-center">🍎</div>
                  <div className="w-8 h-5 bg-gray-200 rounded text-xs flex items-center justify-center">G</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}