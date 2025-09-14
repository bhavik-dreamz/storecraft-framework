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
      <div className={`min-h-screen bg-gradient-to-br from-slate-900 to-black ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
              <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2 opacity-60" style={{animationDirection: 'reverse'}}></div>
            </div>
            <p className="mt-6 text-white text-lg">Loading your cart...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!cart || !cart.lines || cart.lines.length === 0) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-900 to-black ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">Start exploring our amazing products and add some items to your cart.</p>
            <Link
              href="/collections/all"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 to-black ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:space-x-12">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="border-b border-white/10 pb-6 mb-6">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Shopping Cart
              </h1>
              <p className="text-gray-400 mt-1">
                {cart.lines.length} {cart.lines.length === 1 ? 'item' : 'items'} ready for checkout
              </p>
            </div>

            <div className="space-y-6">
              {cart.lines.map((line) => (
                <div key={line.id} className="flex items-start space-x-4 p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <Link href={`/products/${line.merchandise.product.handle}`}>
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl overflow-hidden group">
                        {line.merchandise.image ? (
                          <Image
                            src={line.merchandise.image.url}
                            alt={line.merchandise.image.altText || line.merchandise.product.title}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <h3 className="text-lg font-semibold text-white mb-1">
                          <Link 
                            href={`/products/${line.merchandise.product.handle}`}
                            className="hover:text-purple-300 transition-colors"
                          >
                            {line.merchandise.product.title}
                          </Link>
                        </h3>
                        
                        {/* Variant details */}
                        {line.merchandise.title !== 'Default Title' && (
                          <p className="text-sm text-gray-400 mb-2">
                            {line.merchandise.title}
                          </p>
                        )}

                        {/* Attributes */}
                        {line.attributes && line.attributes.length > 0 && (
                          <div className="mb-2">
                            {line.attributes.map((attr) => (
                              <span key={attr.key} className="inline-block text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-full mr-2">
                                {attr.key}: {attr.value}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
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
                        className="w-10 h-10 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                        aria-label="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Quantity selector */}
                    <div className="mt-4 flex items-center">
                      <label className="text-sm text-gray-400 mr-4">Qty:</label>
                      <div className="flex items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateItem(line.id, Math.max(1, line.quantity - 1))}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                          disabled={line.quantity <= 1}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="px-4 py-2 text-white min-w-[3rem] text-center font-medium">
                          {line.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(line.id, line.quantity + 1)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
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
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}</span>
                </div>
                
                {cart.cost.totalTaxAmount && (
                  <div className="flex justify-between text-gray-300">
                    <span>Tax</span>
                    <span>{formatPrice(cart.cost.totalTaxAmount.amount, cart.cost.totalTaxAmount.currencyCode)}</span>
                  </div>
                )}

                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between text-xl font-bold text-white">
                    <span>Total</span>
                    <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                      {formatPrice(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="space-y-4">
                <a
                  href={cart.checkoutUrl}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 px-6 rounded-lg transition-all duration-300 text-center font-semibold block hover:shadow-lg hover:shadow-purple-500/30 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure Checkout</span>
                </a>
                
                <Link
                  href="/collections/all"
                  className="w-full text-center text-gray-300 hover:text-white py-3 px-4 text-sm font-medium block transition-colors border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/5"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Secure SSL</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}