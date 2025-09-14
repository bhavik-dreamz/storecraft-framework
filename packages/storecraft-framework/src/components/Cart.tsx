import React, { useState } from 'react'
import { useCart, useAuth } from '../providers'
import { clsx } from 'clsx'

interface CartProps {
  className?: string
  showCheckout?: boolean
}

export function Cart({ className, showCheckout = true }: CartProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { cart, updateItem, removeItem, isLoading } = useCart()
  const { customer } = useAuth()

  const formatPrice = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(parseFloat(amount))
  }

  const handleQuantityChange = async (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(lineId)
    } else {
      await updateItem(lineId, quantity)
    }
  }

  const toggleCart = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Cart Toggle Button */}
      <button
        type="button"
        onClick={toggleCart}
        className={clsx(
          'relative rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500',
          className
        )}
        aria-label="Shopping cart"
      >
        <ShoppingBagIcon className="h-6 w-6" />
        {cart && cart.totalQuantity > 0 && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {cart.totalQuantity}
          </span>
        )}
      </button>

      {/* Cart Slideout */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-25"
            onClick={toggleCart}
          />
          
          {/* Cart Panel */}
          <div className="fixed right-0 top-0 z-50 h-full w-96 bg-white shadow-xl">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900">Shopping cart</h2>
                <button
                  type="button"
                  onClick={toggleCart}
                  className="rounded-md p-2 text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Cart Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {!cart || cart.lines.length === 0 ? (
                  <div className="text-center">
                    <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.lines.map((line) => (
                      <div key={line.id} className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          {line.merchandise.image && (
                            <img
                              src={line.merchandise.image.url}
                              alt={line.merchandise.image.altText || 'Product image'}
                              className="h-full w-full object-cover object-center"
                            />
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">
                            {line.merchandise.title}
                          </h4>
                          
                          {line.merchandise.selectedOptions.map((option) => (
                            <p key={option.name} className="text-sm text-gray-500">
                              {option.name}: {option.value}
                            </p>
                          ))}

                          <div className="mt-2 flex items-center justify-between">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(line.id, line.quantity - 1)}
                                disabled={isLoading}
                                className="rounded-full bg-gray-100 p-1 text-gray-400 hover:text-gray-500 disabled:opacity-50"
                                aria-label="Decrease quantity"
                              >
                                <MinusIcon className="h-3 w-3" />
                              </button>
                              
                              <span className="text-sm font-medium">{line.quantity}</span>
                              
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(line.id, line.quantity + 1)}
                                disabled={isLoading}
                                className="rounded-full bg-gray-100 p-1 text-gray-400 hover:text-gray-500 disabled:opacity-50"
                                aria-label="Increase quantity"
                              >
                                <PlusIcon className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Price */}
                            <p className="text-sm font-medium text-gray-900">
                              {formatPrice(
                                line.cost.totalAmount.amount,
                                line.cost.totalAmount.currencyCode
                              )}
                            </p>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => removeItem(line.id)}
                            disabled={isLoading}
                            className="mt-2 text-sm text-red-500 hover:text-red-400 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cart && cart.lines.length > 0 && (
                <div className="border-t border-gray-200 px-6 py-6">
                  {/* Subtotal */}
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>
                      {formatPrice(
                        cart.cost.subtotalAmount.amount,
                        cart.cost.subtotalAmount.currencyCode
                      )}
                    </p>
                  </div>
                  
                  <p className="mt-0.5 text-sm text-gray-500">
                    Shipping and taxes calculated at checkout.
                  </p>

                  {/* Checkout Button */}
                  {showCheckout && (
                    <div className="mt-6">
                      <a
                        href={cart.checkoutUrl}
                        className="flex w-full items-center justify-center rounded-md border border-transparent bg-black px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-800"
                      >
                        Checkout
                      </a>
                    </div>
                  )}

                  {/* Continue Shopping */}
                  <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                    <p>
                      or{' '}
                      <button
                        type="button"
                        className="font-medium text-black hover:text-gray-800"
                        onClick={toggleCart}
                      >
                        Continue Shopping
                        <span aria-hidden="true"> &rarr;</span>
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

// Icon Components
function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z"
      />
    </svg>
  )
}

function XMarkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}