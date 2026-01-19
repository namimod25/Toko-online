import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { Rupiah } from '../utils/Currency'
import { socketService } from '../utils/socket'
import {
  ShoppingCart,
  ArrowLeft,
  Star,
  Package,
  Tag,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  Truck,
  Shield,
  RefreshCw
} from 'lucide-react'
import { RupiahCurency } from '../utils/Currency'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [realTimeUpdates, setRealTimeUpdates] = useState(0)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    fetchProductDetail()
    setupSocketListeners()

    return () => {
      const socket = socketService.getSocket()
      if (socket) {
        socket.off(`product-detail-updated-${id}`)
        socket.off(`product-detail-deleted-${id}`)
        socket.off(`product-stock-updated-${id}`)
      }
    }
  }, [id, user, navigate])

  const setupSocketListeners = () => {
    const socket = socketService.connect()

    // Join specific product room
    socket.emit('join-product-room', id)

    socket.on(`product-detail-updated-${id}`, (updatedProduct) => {
      console.log('Product detail updated:', updatedProduct)
      setProduct(updatedProduct)
      setRealTimeUpdates(prev => prev + 1)
      showNotification('Product updated in real-time!')
    })

    socket.on(`product-detail-deleted-${id}`, (deletedProductId) => {
      console.log('Product deleted:', deletedProductId)
      showNotification('This product has been removed')
      setTimeout(() => navigate('/products'), 2000)
    })

    socket.on(`product-stock-updated-${id}`, ({ productId, stock }) => {
      console.log('Stock updated:', stock)
      setProduct(prev => prev ? { ...prev, stock } : null)
      setRealTimeUpdates(prev => prev + 1)
      showNotification(`Stock updated: ${stock} available`)
    })
  }

  const showNotification = (message) => {
    // Create notification element
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up flex items-center'
    notification.innerHTML = `
      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
      <span>${message}</span>
    `

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  const fetchProductDetail = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/products/${id}`)
      setProduct(response.data)

      // Fetch related products
      fetchRelatedProducts(response.data.category)
    } catch (error) {
      console.error('Error fetching product detail:', error)
      setError('Product not found or failed to load')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async (category) => {
    try {
      const response = await axios.get('/api/products')
      const related = response.data
        .filter(p => p.category === category && p.id !== parseInt(id))
        .slice(0, 4)
      setRelatedProducts(related)
    } catch (error) {
      console.error('Error fetching related products:', error)
    }
  }

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity)
    }
  }

  const addToCart = async () => {
    if (!product || product.stock === 0) {
      alert('Product is out of stock')
      return
    }

    try {
      await axios.post('/api/cart/add', {
        productId: product.id,
        quantity
      })

      alert(`Added ${quantity} ${product.name} to cart!`)
      setQuantity(1)
    } catch (error) {
      alert('Failed to add product to cart')
    }
  }

  const shareProduct = () => {
    const shareUrl = window.location.href
    const shareText = `Check out ${product?.name} - ${Rupiah(product?.price)}`

    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: shareText,
        url: shareUrl,
      })
    } else {
      navigator.clipboard.writeText(shareUrl)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <Link
            to="/products"
            className="inline-flex items-center bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  // Sample images array (you can modify this based on your product data)
  const productImages = [
    product.image,
    product.image.replace('300x200', '400x300'),
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Real-time Update Indicator */}
      {realTimeUpdates > 0 && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg z-40 animate-pulse flex items-center">
          <RefreshCw className="h-4 w-4 mr-2" />
          <span className="text-sm">Live Updates</span>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-blue-600">Products</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/600x400?text=No+Image"
                }}
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`border-2 rounded-lg overflow-hidden ${selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-20 object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/100x80?text=Image"
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Image Navigation */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : productImages.length - 1)}
                className="p-2 text-gray-600 hover:text-blue-600"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <span className="text-sm text-gray-500">
                {selectedImage + 1} / {productImages.length}
              </span>
              <button
                onClick={() => setSelectedImage(prev => prev < productImages.length - 1 ? prev + 1 : 0)}
                className="p-2 text-gray-600 hover:text-blue-600"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={shareProduct}
                    className="p-2 text-gray-600 hover:text-blue-600 transition duration-200"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-red-600 transition duration-200">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">4.5 (128 reviews)</span>
                </div>
                <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  {product.category}
                </span>
              </div>

              <p className="text-4xl font-bold text-green-600 mb-6">
                {Rupiah(product.price)}
              </p>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Stock Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="font-medium">Availability:</span>
                </div>
                <span className={`font-semibold ${product.stock > 10 ? 'text-green-600' :
                    product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                  {product.stock > 10 ? 'In Stock' :
                    product.stock > 0 ? `Low Stock (${product.stock} left)` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <label className="block font-medium text-gray-700">Quantity</label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product.stock || 0)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  Max: {product.stock} items
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </button>

              <button className="flex-1 bg-gray-900 text-white py-4 px-6 rounded-lg hover:bg-black transition duration-200 font-semibold">
                Buy Now
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-sm text-gray-500">On orders over Rp 500.000</p>
                </div>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">Warranty</p>
                  <p className="text-sm text-gray-500">1 Year manufacturer warranty</p>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-3 pt-6 border-t">
              <div className="flex items-center">
                <Tag className="h-5 w-5 text-gray-400 mr-3" />
                <span className="font-medium">Category:</span>
                <span className="ml-2 text-gray-600">{product.category}</span>
              </div>
              <div className="flex items-center">
                <Package className="h-5 w-5 text-gray-400 mr-3" />
                <span className="font-medium">Stock:</span>
                <span className="ml-2 text-gray-600">{product.stock} units</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <span className="font-medium">Added:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(product.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
              <Link
                to="/products"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/products/${relatedProduct.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition duration-300 transform hover:-translate-y-1"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover transition duration-300 hover:scale-105"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x200?text=No+Image"
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {relatedProduct.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-green-600">
                        {Rupiah(relatedProduct.price)}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {relatedProduct.category}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link
            to="/products"
            className="inline-flex items-center bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition duration-200 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail