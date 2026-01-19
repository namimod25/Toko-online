import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Key, Lock, CheckCircle, XCircle } from 'lucide-react'
import axios from 'axios'

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleChange = (e) => {
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
    
    if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required'
    if (!formData.newPassword) newErrors.newPassword = 'New password is required'
    if (formData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/api/password/change', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      })

      setSuccess(true)
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      // Redirect to profile after 3 seconds
      setTimeout(() => {
        navigate('/profile')
      }, 3000)

    } catch (error) {
      console.error('Change password error:', error)
      setErrors({ 
        submit: error.response?.data?.error || 'Failed to change password' 
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    navigate('/login')
    return null
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-green-600 py-6 px-8">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white">Password Changed</h2>
              </div>
            </div>
            
            <div className="py-8 px-8 text-center">
              <p className="text-gray-600 mb-6">
                Your password has been changed successfully.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Redirecting to your profile...
              </p>
              <button
                onClick={() => navigate('/profile')}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
              >
                Go to Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-blue-600 py-6 px-8">
            <div className="text-center">
              <Key className="h-16 w-16 text-white mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white">Change Password</h2>
              <p className="text-blue-100 text-sm mt-2">
                Update your account password
              </p>
            </div>
          </div>

          <div className="py-8 px-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter current password"
                  />
                </div>
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter new password (min. 6 characters)"
                  />
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm new password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {errors.submit && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                  <div className="flex">
                    <XCircle className="h-5 w-5 text-red-400 mr-3" />
                    <p className="text-sm text-red-700">{errors.submit}</p>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  ← Back to Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword