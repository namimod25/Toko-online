import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

import {
  User,
  Package,
  Heart,
  Settings,
  ShoppingBag,
  Clock,
  MapPin,
  Phone,
  Mail,
  Edit,
  LogOut,
  Save,
  X,
  CheckCircle
} from 'lucide-react'
import axios from 'axios'

const CustomerDashboard = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    bio: ''
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, activeTab])

  useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        postalCode: profile.postalCode || '',
        country: profile.country || '',
        bio: profile.bio || ''
      })
    }
  }, [profile])

  const fetchData = async () => {
    try {
      setLoading(true)

      if (activeTab === 'profile') {
        const response = await axios.get('/api/customer/profile')
        setProfile(response.data)
      } else if (activeTab === 'orders') {
        const response = await axios.get('/api/customer/orders')
        setOrders(response.data.orders)
      } else if (activeTab === 'wishlist') {
        const response = await axios.get('/api/customer/wishlist')
        setWishlist(response.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
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
  }

  const handleEditClick = () => {
    setEditing(true)
    setSuccessMessage('')
    setErrorMessage('')
  }

  const handleCancelEdit = () => {
    setEditing(false)
    if (profile) {
      setFormData({
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        postalCode: profile.postalCode || '',
        country: profile.country || '',
        bio: profile.bio || ''
      })
    }
  }

  const handleSaveProfile = async () => {
    setSaveLoading(true)
    setErrorMessage('')
    try {
      await axios.put('/api/customer/profile', formData)
      setSuccessMessage('Profile updated successfully!')
      setEditing(false)
      fetchData()

      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setErrorMessage(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p>Please login to access customer dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                    Customer
                  </span>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <User className="h-5 w-5" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${activeTab === 'orders'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Package className="h-5 w-5" />
                  <span>My Orders</span>
                </button>

                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${activeTab === 'wishlist'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Heart className="h-5 w-5" />
                  <span>Wishlist</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${activeTab === 'settings'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </button>
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-semibold">{orders.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Wishlist Items</span>
                  <span className="font-semibold">{wishlist.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {/* Profile Tab */}
                {activeTab === 'profile' && profile && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    {/* Success Message */}
                    {successMessage && (
                      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <p className="text-green-700">{successMessage}</p>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {errorMessage && (
                      <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">{errorMessage}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                      {!editing ? (
                        <button
                          onClick={handleEditClick}
                          className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition duration-200"
                          title="Edit Profile"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50 transition duration-200"
                            title="Cancel"
                          >
                            <X className="h-5 w-5" />
                          </button>
                          <button
                            onClick={handleSaveProfile}
                            disabled={saveLoading}
                            className="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50 transition duration-200 disabled:opacity-50"
                            title="Save"
                          >
                            <Save className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-gray-900">{profile.user?.name || user.name}</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <p className="text-gray-900">{profile.user?.email || user.email}</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                          </label>
                          {editing ? (
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter phone number"
                            />
                          ) : (
                            <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              <p className="text-gray-900">{profile.phone || 'Not set'}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          {editing ? (
                            <textarea
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter your address"
                            />
                          ) : (
                            <div className="flex items-start bg-gray-50 p-3 rounded-lg">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                              <div>
                                <p className="text-gray-900">{profile.address || 'Not set'}</p>
                                {profile.city && (
                                  <p className="text-gray-600 text-sm mt-1">
                                    {profile.city}, {profile.postalCode} {profile.country}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {editing && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  City
                                </label>
                                <input
                                  type="text"
                                  name="city"
                                  value={formData.city}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="City"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Postal Code
                                </label>
                                <input
                                  type="text"
                                  name="postalCode"
                                  value={formData.postalCode}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Postal Code"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Country
                              </label>
                              <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Country"
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bio
                          </label>
                          {editing ? (
                            <textarea
                              name="bio"
                              value={formData.bio}
                              onChange={handleInputChange}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Tell us about yourself"
                            />
                          ) : (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-gray-900">{profile.bio || 'No bio yet'}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {editing && (
                      <div className="mt-6 flex justify-end space-x-4">
                        <button
                          onClick={handleCancelEdit}
                          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={saveLoading}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                        >
                          {saveLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
                      <Link
                        to="/products"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                      >
                        Continue Shopping
                      </Link>
                    </div>

                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                        <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                        <Link
                          to="/products"
                          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                          Browse Products
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900">Order #{order.orderNumber}</h4>
                                <p className="text-sm text-gray-600">
                                  <Clock className="inline h-3 w-3 mr-1" />
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-green-600">
                                  Rp {order.total.toLocaleString()}
                                </p>
                                <span className={`inline-block px-2 py-1 rounded text-xs ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                    order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                                      order.status === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                                        'bg-red-100 text-red-800'
                                  }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Wishlist Tab */}
                {activeTab === 'wishlist' && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h2>

                    {wishlist.length === 0 ? (
                      <div className="text-center py-12">
                        <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Wishlist Empty</h3>
                        <p className="text-gray-600 mb-6">Save products you love to your wishlist</p>
                        <Link
                          to="/products"
                          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                          Browse Products
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map((item) => (
                          <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-40 object-cover"
                            />
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                {item.product.name}
                              </h4>
                              <p className="text-green-600 font-bold mb-3">
                                Rp {item.product.price.toLocaleString()}
                              </p>
                              <div className="flex justify-between">
                                <Link
                                  to={`/products`}
                                  className="text-blue-600 hover:text-blue-700 text-sm"
                                >
                                  View Product
                                </Link>
                                <button className="text-red-600 hover:text-red-700 text-sm">
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>

                    <div className="space-y-6">
                      {/* Change Password Form */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                        <form className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current Password
                            </label>
                            <input
                              type="password"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter current password"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter new password"
                            />
                          </div>
                          <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                          >
                            Update Password
                          </button>
                        </form>
                      </div>

                      {/* Account Preferences */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="email-notifications"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="email-notifications" className="ml-2 text-gray-700">
                              Email notifications for new products
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="promo-emails"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="promo-emails" className="ml-2 text-gray-700">
                              Promotional emails
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard