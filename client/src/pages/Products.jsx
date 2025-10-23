import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { Rupiah } from '../utils/Currency'
import ProductDescription from '../components/Product/ProductDescription'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  // Track window width for responsive maxLength
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }

    fetchProducts()
  }, [user, navigate])

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products')
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
      if (error.response?.status === 401) {
        navigate('/')
      }
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId) => {
    try {
      await axios.post('/api/cart/add', { productId, quantity: 1 })
      alert('Product added to cart!')
    } catch (error) {
      alert('Failed to add product to cart')
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
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 md:mb-8 text-center md:text-left">
        Our Products
      </h1>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No products available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition duration-300 flex flex-col h-full">
              <div className="flex-shrink-0">
                <img
                  src={product.image || "https://via.placeholder.com/300x200?text=No+Image"}
                  alt={product.name}
                  className="w-full h-40 sm:h-48 md:h-56 object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x200?text=No+Image"
                  }}
                />
              </div>

              <div className="p-3 sm:p-4 flex flex-col flex-grow">
                {/* Product Name */}
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                  {product.name}
                </h3>

                {/* Description - Responsive */}
                <div className="mb-3 flex-grow">
                  <ProductDescription
                    description={product.description}
                    maxLength={windowWidth < 768 ? 100 : 150}
                  />
                </div>

                {/* Category */}
                <div className="mb-3">
                  <span className="inline-block text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>

                {/* Price and Add to Cart */}
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                    {Rupiah(product.price)}
                  </span>
                  <button
                    onClick={() => addToCart(product.id)}
                    className="bg-blue-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded hover:bg-blue-600 transition duration-200 font-medium text-xs sm:text-sm"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Products