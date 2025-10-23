import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { Rupiah } from '../../utils/Currency'

const AdminProducts = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
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

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchProducts()
    }
  }, [user])

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

      await axios.post('/api/admin/products', productData)

      setFormData({
        name: '',
        description: '',
        price: '',
        image: '',
        stock: '',
        category: ''
      })
      setShowAddForm(false)
      setErrors({})

      fetchProducts()
      alert('Product created successfully!')
    } catch (error) {
      console.error('Error creating product:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.details?.[0]?.message || 'Failed to create product'
      alert(`Error: ${errorMessage}`)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      await axios.delete(`/api/admin/products/${productId}`)
      fetchProducts()
      alert('Product deleted successfully!')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

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
          <p className="text-gray-600 mt-2">Manage your store products</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200 font-semibold"
        >
          Add New Product
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 text-xs sm:text-sm leading-relaxed">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition duration-300">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {product.name}
              </h3>

              <div className="mb-3 flex-grow">
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-3 md:line-clamp-4">
                  {product.description}
                </p>
              </div>

              <div className="flex justify-between items-center mb-3">
                <span className="text-2xl font-bold text-green-600">
                  {Rupiah(product.price)}
                </span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Stock: {product.stock}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 bg-blue-100 px-2 py-1 rounded">
                  {product.category}
                </span>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>

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
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
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
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
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
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="1000000"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Contoh: 1.000.000 untuk Rp 1.000.000
                    </p>
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
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.stock ? 'border-red-500' : 'border-gray-300'
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
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.image ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.image && (
                    <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="e.g., Smartphone, Laptop, etc."
                  />
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setErrors({})
                      setFormData({
                        name: '',
                        description: '',
                        price: '',
                        image: '',
                        stock: '',
                        category: ''
                      })
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
                    disabled={submitLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitLoading ? 'Creating...' : 'Create Product'}
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