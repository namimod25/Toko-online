import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { Rupiah } from '../utils/Currency'
import { socketService } from '../utils/socket'
import { RefreshCw, ShoppingCart, Heart, Type } from 'lucide-react'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [realTimeLoading, setRealTimeLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Moved to top and cleaned up
  const showRealTimeNotification = (message, type = 'success') => {
    setRealTimeLoading(true)

    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up ${type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
      }`

    notification.innerHTML = `
      <div class="flex items-center">
        ${type === 'error' ?
        '<svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>' :
        '<svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
      }
        <span>${message}</span>
      </div>
    `

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
      setRealTimeLoading(false)
    }, 3000)
  }

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }

    fetchProducts()
    setupSocketListeners()

    // Cleanup socket listeners on unmount
    return () => {
      const socket = socketService.getSocket()
      if (socket) {
        socket.off('product-created')
        socket.off('product-updated')
        socket.off('product-deleted')
        socket.off('stock-updated')
      }
    }
  }, [user, navigate])

  const setupSocketListeners = () => {
    const socket = socketService.connect()

    socket.on('product-created', (newProduct) => {

      setProducts(prev => {

        const exists = prev.find(p => p.id === newProduct.id)
        if (!exists) {
          return [newProduct, ...prev]
        }
        return prev
      })
      showRealTimeNotification(`New product: ${newProduct.name}`)
    })

    socket.on('product-updated', (updatedProduct) => {
      console.log('Product updated:', updatedProduct)
      setProducts(prev =>
        prev.map(product =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      )
      showRealTimeNotification(`Product updated: ${updatedProduct.name}`)
    })

    socket.on('product-deleted', (deletedProductId) => {
      console.log('Product deleted:', deletedProductId)
      setProducts(prev =>
        prev.filter(product => product.id !== deletedProductId)
      )
      showRealTimeNotification('Product deleted')
    })

    socket.on('stock-updated', ({ productId, stock }) => {
      console.log('Stock updated:', productId, stock)
      setProducts(prev =>
        prev.map(product =>
          product.id === productId ? { ...product, stock } : product
        )
      )
      showRealTimeNotification(`Stock updated for product ${productId}`)
    })
  }


  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products')
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId) => {
    try {
      await axios.post('/api/cart/add',
        {
          productId,
          quantity: 1
        })

      // Show success message
      const product = products.find(p => p.id === productId)
      showRealTimeNotification(`Added ${product?.name} to cart!`)

      //update stock
      setProducts(prev =>
        prev.map(p =>
          p.id === productId ? { ...p, stock: p.stock - 1 } : p
        )
      )
    } catch (error) {
      console.error('Add to cart error:', error)
      const errData = error.response?.data
      const errorMessage = errData?.details || errData?.error || 'Failed to Add product to Cart'
      showRealTimeNotification(errorMessage, 'error')
    }
  }


  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 md:mb-8 text-center md:text-left">Our Products</h1>
            <p className="text-gray-600 mt-2">
              Discover amazing products {realTimeLoading && '(Updating...)'}
            </p>
          </div>

          {/* Real-time Status Indicator */}
          <div className="flex items-center space-x-4">
            {realTimeLoading && (
              <div className="flex items-center text-green-600">
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                <span className="text-sm">Live Updates</span>
              </div>
            )}
            <div className="text-sm text-gray-500">
              {products.length} products available
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition duration-300 transform hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition duration-300 hover:scale-105"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x200?text=No+Image"
                  }}
                />

                {/* Stock Status Badge */}
                <div className="absolute top-2 left-2">
                  {product.stock === 0 ? (
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Out of Stock
                    </span>
                  ) : product.stock < 10 ? (
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Low Stock: {product.stock}
                    </span>
                  ) : (
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      In Stock: {product.stock}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="mb-3">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">
                    {Rupiah(product.price)}
                  </span>
                  <button
                    onClick={() => addToCart(product.id)}
                    disabled={product.stock === 0}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products available
            </h3>
            <p className="text-gray-600">
              Check back later for new products
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products