import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  // Check if user previously selected remember me
  useEffect(() => {
    const savedRememberMe = localStorage.getItem('rememberMe')
    if (savedRememberMe === 'true') {
      setRememberMe(true)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Basic validation
    if (!formData.email) {
      setErrors({ email: 'Email is required' })
      setIsLoading(false)
      return
    }

    if (!formData.password) {
      setErrors({ password: 'Password is required' })
      setIsLoading(false)
      return
    }

    try {
      console.log('Attempting login with:', { email: formData.email, rememberMe })
      
      const result = await login(formData.email, formData.password, rememberMe)
      console.log('Login result:', result)
      
      if (result.success) {
        navigate('/')
      } else {
        setErrors({ submit: result.error || 'Login failed' })
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ submit: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-6 px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-blue-100 text-sm">
                Sign in to your account
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="py-8 px-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                    errors.email ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className={`block w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                    errors.password ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Keep me logged in
                </label>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-medium text-blue-600 hover:text-blue-500 transition duration-200"
                  >
                    Sign up
                  </Link>
                </p>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login