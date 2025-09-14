import React from 'react'

interface AdminOrderDetailProps {
  orderId: string;
}

export const AdminOrderDetail: React.FC<AdminOrderDetailProps> = ({ orderId }) => {
  return (
    <div className="test-theme-admin-order max-w-7xl mx-auto px-4 py-8">
      {/* Theme-specific header */}
      <div className="bg-purple-50 p-4 mb-6 rounded-lg border border-purple-200">
        <p className="text-purple-800 text-sm font-medium">
          🎨 Test Theme Active - Admin Order Detail Page
        </p>
        <p className="text-purple-600 text-xs mt-1">
          Order ID: <code className="bg-purple-100 px-2 py-1 rounded">{orderId}</code>
        </p>
      </div>
      
      {/* Order Header */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{orderId}
          </h1>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Paid
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              Processing
            </span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Customer</h3>
            <p className="text-gray-600">John Doe</p>
            <p className="text-gray-600">john.doe@example.com</p>
            <p className="text-gray-600">+1 (555) 123-4567</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
            <p className="text-gray-600">123 Main Street</p>
            <p className="text-gray-600">New York, NY 10001</p>
            <p className="text-gray-600">United States</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">$299.97</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-gray-900">$9.99</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span className="text-gray-900">$24.00</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-1">
                <span>Total:</span>
                <span>$333.96</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
        <div className="space-y-4">
          {[
            { name: 'Premium T-Shirt', sku: 'TSH-001', qty: 2, price: 99.99 },
            { name: 'Classic Jeans', sku: 'JNS-002', qty: 1, price: 199.99 }
          ].map((item, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500">📦</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                <p className="text-sm text-gray-500">Quantity: {item.qty}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${item.price}</p>
                <p className="text-sm text-gray-500">${item.price * item.qty} total</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Actions */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Update Status
          </button>
          <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
            Fulfill Order
          </button>
          <button className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
            Print Invoice
          </button>
        </div>
      </div>
      
      {/* Theme Features Demo */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Theme Features Demo:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>✅ Admin order routing working</li>
          <li>✅ Order ID parameter: {orderId}</li>
          <li>✅ Admin authentication would be checked</li>
          <li>✅ Theme customization applied</li>
          <li>✅ Order management interface active</li>
        </ul>
      </div>
    </div>
  )
}