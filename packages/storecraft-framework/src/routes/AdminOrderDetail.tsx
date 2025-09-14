import React, { useState } from 'react'
import { Metadata } from 'next'
import { Order } from '../types'
import { formatPrice, formatDate } from '../utils/formatters'
import { cn } from '../utils/cn'

export const metadata: Metadata = {
  title: 'Order Details | Admin Dashboard',
  description: 'View and manage order details',
  robots: 'noindex, nofollow'
}

interface AdminOrderDetailProps {
  order: Order
  params: {
    orderId: string
  }
}

type OrderStatus = 'PENDING' | 'FULFILLED' | 'PARTIALLY_FULFILLED' | 'CANCELLED' | 'REFUNDED'
type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED' | 'VOIDED'

export const AdminOrderDetail: React.FC<AdminOrderDetailProps> = ({ order, params }) => {
  const [fulfillmentStatus, setFulfillmentStatus] = useState<OrderStatus>(order.fulfillmentStatus as OrderStatus || 'PENDING')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')

  const handleFulfillOrder = async () => {
    setIsProcessing(true)
    try {
      // Call API to fulfill order
      console.log('Fulfilling order:', order.id, 'with tracking:', trackingNumber)
      setFulfillmentStatus('FULFILLED')
    } catch (error) {
      console.error('Failed to fulfill order:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRefundOrder = async () => {
    setIsProcessing(true)
    try {
      // Call API to process refund
      console.log('Processing refund:', {
        orderId: order.id,
        amount: refundAmount,
        reason: refundReason
      })
      setShowRefundModal(false)
      setRefundAmount('')
      setRefundReason('')
    } catch (error) {
      console.error('Failed to process refund:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const calculateItemTotal = (item: any) => {
    // For now using any type due to interface limitations
    const price = item.variant?.price?.amount ? parseFloat(item.variant.price.amount) : 0
    return price * item.quantity
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'FULFILLED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
                <p className="text-gray-600">Placed on {formatDate(order.processedAt)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={cn(
                "px-3 py-1 text-sm font-medium rounded-full border",
                getStatusColor(fulfillmentStatus)
              )}>
                {fulfillmentStatus.toLowerCase().replace('_', ' ')}
              </span>
              
              {fulfillmentStatus === 'PENDING' && (
                <button
                  onClick={handleFulfillOrder}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {isProcessing ? 'Processing...' : 'Fulfill Order'}
                </button>
              )}
              
              <button
                onClick={() => setShowRefundModal(true)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium"
              >
                Refund
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Order Items */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
                <p className="text-sm text-gray-600">{order.lineItems?.length || 0} items</p>
              </div>
              
              <div className="divide-y">
                {order.lineItems?.map((item, index) => (
                  <div key={index} className="p-6 flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {item.variant?.image ? (
                        <img
                          src={item.variant.image.url}
                          alt={item.variant.image.altText || item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          {item.variant?.title && item.variant.title !== 'Default Title' && (
                            <p className="text-sm text-gray-500">{item.variant.title}</p>
                          )}
                          <p className="text-sm text-gray-500">SKU: {item.variant?.sku || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {item.variant?.price ? formatPrice(item.variant.price) : 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          <p className="text-sm font-medium text-gray-900">
                            ${calculateItemTotal(item).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Totals */}
              <div className="p-6 border-t bg-gray-50">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{formatPrice(order.subtotalPrice)}</span>
                  </div>
                  {order.totalShippingPrice && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">{formatPrice(order.totalShippingPrice)}</span>
                    </div>
                  )}
                  {order.totalTax && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-900">{formatPrice(order.totalTax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-medium pt-2 border-t">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatPrice(order.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fulfillment Information */}
            {fulfillmentStatus === 'FULFILLED' && (
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Fulfillment Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping Carrier
                    </label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>Select carrier</option>
                      <option>UPS</option>
                      <option>FedEx</option>
                      <option>USPS</option>
                      <option>DHL</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
                  Update Tracking
                </button>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Order Placed</p>
                    <p className="text-sm text-gray-500">{formatDate(order.processedAt)}</p>
                  </div>
                </div>
                
                {fulfillmentStatus === 'FULFILLED' && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Order Fulfilled</p>
                      <p className="text-sm text-gray-500">Just now</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-500">Delivered</p>
                    <p className="text-sm text-gray-400">Pending</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Customer Information */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer</h2>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">
                    {order.customer?.firstName} {order.customer?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{order.customer?.email}</p>
                  {order.customer?.phone && (
                    <p className="text-sm text-gray-500">{order.customer.phone}</p>
                  )}
                </div>
                
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 mb-1">Customer since</p>
                  <p className="text-sm text-gray-900">
                    {order.customer?.createdAt ? formatDate(order.customer.createdAt) : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total orders</p>
                  <p className="text-sm text-gray-900">{order.customer?.numberOfOrders || 0}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
                <div className="text-sm text-gray-900 space-y-1">
                  <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zip}</p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                </div>
              </div>
            )}

            {/* Billing Address */}
            {order.billingAddress && (
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h2>
                <div className="text-sm text-gray-900 space-y-1">
                  <p>{order.billingAddress.firstName} {order.billingAddress.lastName}</p>
                  <p>{order.billingAddress.address1}</p>
                  {order.billingAddress.address2 && <p>{order.billingAddress.address2}</p>}
                  <p>{order.billingAddress.city}, {order.billingAddress.province} {order.billingAddress.zip}</p>
                  <p>{order.billingAddress.country}</p>
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    order.paymentGatewayNames?.includes('paid') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  )}>
                    {order.paymentGatewayNames?.[0] || 'Pending'}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Gateway</span>
                  <span className="text-gray-900">{order.paymentGatewayNames?.[0] || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between text-sm font-medium pt-2 border-t">
                  <span className="text-gray-900">Amount Paid</span>
                  <span className="text-gray-900">{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  📧 Send Email to Customer
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  🖨️ Print Order
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  📋 Duplicate Order
                </button>
                <button 
                  onClick={() => setShowRefundModal(true)}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  💸 Process Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Process Refund</h3>
              <button 
                onClick={() => setShowRefundModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Amount
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum refund: {formatPrice(order.totalPrice)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Refund
                </label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select reason</option>
                  <option value="customer_request">Customer Request</option>
                  <option value="defective_item">Defective Item</option>
                  <option value="wrong_item">Wrong Item Shipped</option>
                  <option value="damaged_in_transit">Damaged in Transit</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRefundOrder}
                  disabled={isProcessing || !refundAmount || !refundReason}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Process Refund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}