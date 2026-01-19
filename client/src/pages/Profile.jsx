import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  User, 
  Mail, 
  Calendar, 
  Shield,
  Key,
  Save,
  X,
  MapPin,
  Phone,
  CheckCircle
} from 'lucide-react'
import axios from 'axios'

const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: ''
  })
  const [errors, setErrors] = useState({})
  const [saveLoading, setSaveLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/profile')
      setProfile(response.data)
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        city: response.data.city || '',
        country: response.data.country || '',
        postalCode: response.data.postalCode || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
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
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.country.trim()) newErrors.country = 'Country is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaveLoading(true)
    try {
      await axios.put('/api/profile', formData)
      
      setSuccessMessage('Profile updated successfully!')
      setEditing(false)
      fetchProfile() // Refresh data
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setErrors({ submit: error.response?.data?.error || 'Failed to update profile' })
    } finally {
      setSaveLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Please login to view your profile
        </h2>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2">Manage your personal information</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-green-700">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold text-white">{profile?.name || 'User'}</h2>
                    <p className="text-blue-100">{profile?.email}</p>
                    <div className="flex items-center mt-1">
                      <Shield className="h-4 w-4 text-blue-200 mr-1" />
                      <span className="text-xs text-blue-200 bg-blue-800 bg-opacity-30 px-2 py-1 rounded">
                        {profile?.role || 'CUSTOMER'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setEditing(!editing)}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-200 font-medium"
                >
                  {editing ? 'Cancel Editing' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {/* Profile Form */}
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-500" />
                      Personal Information
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                          } ${!editing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          } ${!editing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                          } ${!editing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                          placeholder="+62 812-3456-7890"
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Member Since
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={new Date(profile?.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                          disabled
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                      Address Information
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!editing}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.address ? 'border-red-500' : 'border-gray-300'
                        } ${!editing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                        placeholder="Your full address"
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.city ? 'border-red-500' : 'border-gray-300'
                          } ${!editing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                          placeholder="City"
                        />
                        {errors.city && (
                          <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="12345"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country *
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        disabled={!editing}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.country ? 'border-red-500' : 'border-gray-300'
                        } ${!editing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                        placeholder="Country"
                      />
                      {errors.country && (
                        <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                      )}
                    </div>
                  </div>
                </div>

                {errors.submit && (
                  <div className="mt-6 rounded-lg bg-red-50 p-4 border border-red-200">
                    <p className="text-sm text-red-700">{errors.submit}</p>
                  </div>
                )}

                {editing && (
                  <div className="mt-8 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                    >
                      <X className="h-4 w-4 inline mr-2" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saveLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Account Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Change Password Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Key className="h-5 w-5 mr-2 text-blue-500" />
                Change Password
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Update your password to keep your account secure
              </p>
              <button
                onClick={() => window.location.href = '/change-password'}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
              >
                Change Password
              </button>
            </div>

            {/* Account Security */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-500" />
                Account Security
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Manage your account security settings
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Two-factor Authentication</span>
                  <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">Disabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Login History</span>
                  <span className="text-xs text-gray-500">Last login: Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile