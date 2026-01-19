import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Rupiah } from '../utils/Currency'

import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  CreditCard
} from 'lucide-react'
import axios from 'axios'

const Cart = () => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchCart()
  }, [user, navigate])

  const fetchCart = async () => {
    try {
      const response = await axios.get('/api/cart')
      setCart(response.data)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (cartItemId, newQuantity) => {
    try {
      await axios.put(`/api/cart/items/${cartItemId}`, {
        quantity: newQuantity
      })
      fetchCart() // Refresh cart
    } catch (error) {
      console.error('Error updating quantity:', error)
      alert(error.response?.data?.error || 'Failed to update quantity')
    }
  }

  const removeItem = async (cartItemId) => {
    try {
      await axios.delete(`/api/cart/items/${cartItemId}`)
      fetchCart() // Refresh cart
    } catch (error) {
      console.error('Error removing item:', error)
      alert('Failed to remove item from cart')
    }
  }

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return

    try {
      await axios.delete('/api/cart/clear')
      fetchCart() // Refresh cart
    } catch (error) {
      console.error('Error clearing cart:', error)
      alert('Failed to clear cart')
    }
  }

  const handleCheckout = async () => {
    setCheckoutLoading(true)
    try {
      const response = await axios.post('/api/orders/create', {
        shippingAddress: 'Jl. Example No. 123, Jakarta', // Example address
        paymentMethod: 'bank_transfer'
      })

      // Redirect to Midtrans payment page
      window.location.href = response.data.snapRedirectUrl
    } catch (error) {
      console.error('Checkout error:', error)
      alert(error.response?.data?.error || 'Checkout failed')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const calculateTotal = () => {
    if (!cart?.items) return 0
    return cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity)
    }, 0)
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Please login to view your cart
        </h2>
        <Link
          to="/login"
          className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Go to Login
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const cartTotal = calculateTotal()
  const shippingCost = 20000
  const grandTotal = cartTotal + shippingCost

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-600 mb-8">
          {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {!cart?.items || cart.items.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-600 mb-6">
                  Add some products to get started
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center py-4 border-b last:border-0">
                      <div className="flex-shrink-0 w-20 h-20">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/100x100?text=No+Image"
                          }}
                        />
                      </div>

                      <div className="ml-4 flex-1">
                        <h4 className="font-medium text-gray-900 line-clamp-2">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {item.product.category}
                        </p>
                        <p className="text-lg font-bold text-green-600 mt-1">
                          {Rupiah(item.product.price)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center border rounded">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-3 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 py-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 hover:text-gray-900"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition duration-200"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Clear Cart
                  </button>
                  <div className="text-lg font-bold">
                    Subtotal: {Rupiah(cartTotal)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{Rupiah(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{Rupiah(shippingCost)}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-green-600">
                    {Rupiah(grandTotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={!cart?.items?.length || checkoutLoading}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                You will be redirected to Midtrans for secure payment
              </p>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">Test Payment Details</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Card Number:</strong> 4811 1111 1111 1114</p>
                  <p><strong>Expiry:</strong> Any future date</p>
                  <p><strong>CVV:</strong> 123</p>
                  <p><strong>OTP:</strong> 112233</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Link
                to="/products"
                className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium"
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart