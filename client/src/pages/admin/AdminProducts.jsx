import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { Rupiah } from '../../utils/Currency'
import { socketService } from '../../utils/socket'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  RefreshCw,
  Save,
  X,
  Search,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react'

const AdminProducts = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [realTimeUpdates, setRealTimeUpdates] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    stock: '',
    category: ''
  })
  const [errors, setErrors] = useState({})
  const [submitLoading, setSubmitLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'Smartphone', name: 'Smartphone' },
    { id: 'Laptop', name: 'Laptop' },
    { id: 'Tablet', name: 'Tablet' },
    { id: 'Accessories', name: 'Accessories' },
    { id: 'Electronics', name: 'Electronics' }
  ]

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchProducts()
      setupSocketListeners()
      
      const socket = socketService.connect()
      socket.emit('join-admin-room')

      return () => {
        const socket = socketService.getSocket()
        if (socket) {
          socket.off('admin-product-created')
          socket.off('admin-product-updated')
          socket.off('admin-product-deleted')
          socket.off('admin-stock-updated')
        }
      }
    }
  }, [user])

  const setupSocketListeners = () => {
    const socket = socketService.connect()

    socket.on('admin-product-created', (newProduct) => {
      console.log('Admin: New product created', newProduct)
      setProducts(prev => {
        const exists = prev.find(p => p.id === newProduct.id)
        if (!exists) {
          return [newProduct, ...prev]
        }
        return prev
      })
      setRealTimeUpdates(prev => prev + 1)
      showNotification(`New product: ${newProduct.name}`)
    })

    socket.on('admin-product-updated', (updatedProduct) => {
      console.log('Admin: Product updated', updatedProduct)
      setProducts(prev => 
        prev.map(product => 
          product.id === updatedProduct.id ? updatedProduct : product
        )
      )
      setRealTimeUpdates(prev => prev + 1)
      showNotification(`Updated: ${updatedProduct.name}`)
    })

    socket.on('admin-product-deleted', (deletedProductId) => {
      console.log('Admin: Product deleted', deletedProductId)
      setProducts(prev => 
        prev.filter(product => product.id !== deletedProductId)
      )
      setRealTimeUpdates(prev => prev + 1)
      showNotification('Product deleted successfully')
    })

    socket.on('admin-stock-updated', ({ productId, stock }) => {
      console.log('Admin: Stock updated', productId, stock)
      setProducts(prev =>
        prev.map(product =>
          product.id === productId ? { ...product, stock } : product
        )
      )
      setRealTimeUpdates(prev => prev + 1)
    })
  }

  const showNotification = (message) => {
    // Create toast notification
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up'
    notification.textContent = message
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/admin/products')
      setProducts(response.data.products || response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
      alert('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Product name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required'
    if (!formData.image.trim()) newErrors.image = 'Image URL is required'
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Valid stock is required'
    if (!formData.category.trim()) newErrors.category = 'Category is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitLoading(true)
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      }

      if (editingProduct) {
        // Update existing product
        await axios.put(`/api/admin/products/${editingProduct.id}`, productData)
        showNotification('Product updated successfully!')
      } else {
        // Create new product
        await axios.post('/api/admin/products', productData)
        showNotification('Product created successfully!')
      }
      
      resetForm()
      // Tidak perlu fetchProducts() karena sudah realtime
    } catch (error) {
      console.error('Error saving product:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.details?.[0]?.message || 'Failed to save product'
      alert(`Error: ${errorMessage}`)
    } finally {
      setSubmitLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      stock: '',
      category: ''
    })
    setEditingProduct(null)
    setShowForm(false)
    setErrors({})
  }

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      stock: product.stock.toString(),
      category: product.category
    })
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDelete = async (productId, productName) => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await axios.delete(`/api/admin/products/${productId}`)
      // Product akan otomatis terhapus dari state via socket event
      // Tidak perlu fetchProducts() lagi
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const updateStock = async (productId, newStock) => {
    if (newStock < 0) return

    try {
      await axios.patch(`/api/admin/products/${productId}/stock`, {
        stock: newStock
      })
      // Stock akan otomatis update via socket event
    } catch (error) {
      console.error('Error updating stock:', error)
      alert('Failed to update stock')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p>You need administrator privileges to access this page.</p>
        </div>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
          <p className="text-gray-600 mt-2">
            Real-time product management 
            {realTimeUpdates > 0 && (
              <span className="text-green-600 ml-2">
                • {realTimeUpdates} live updates
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {realTimeUpdates > 0 && (
            <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              <span className="text-sm font-medium">Live</span>
            </div>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200 font-semibold flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition duration-300">
            <div className="relative h-48 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition duration-300 hover:scale-105"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x200?text=No+Image"
                }}
              />
              <div className="absolute top-2 right-2">
                {product.stock === 0 ? (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    Out of Stock
                  </span>
                ) : product.stock < 10 ? (
                  <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    Low Stock
                  </span>
                ) : (
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    In Stock
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
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-2xl font-bold text-green-600">
                  {Rupiah(product.price)}
                </span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {product.category}
                </span>
              </div>

              {/* Quick Stock Management */}
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Stock:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateStock(product.id, product.stock - 1)}
                    disabled={product.stock <= 0}
                    className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  >
                    -
                  </button>
                  <span className="font-semibold text-gray-900 min-w-8 text-center">
                    {product.stock}
                  </span>
                  <button
                    onClick={() => updateStock(product.id, product.stock + 1)}
                    className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 transition duration-200"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
                
                <button
                  onClick={() => handleDelete(product.id, product.name)}
                  className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200 font-medium"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {products.length === 0 ? 'No products found' : 'No products match your search'}
          </h3>
          <p className="text-gray-600 mb-6">
            {products.length === 0 
              ? 'Get started by creating your first product' 
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {products.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              Create First Product
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter product description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (IDR) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="1000"
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="1000000"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.stock ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {errors.stock && (
                      <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.image ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.image && (
                    <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                  )}
                  {formData.image && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="h-32 object-cover rounded border"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL'
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.filter(cat => cat.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                    disabled={submitLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {submitLoading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts