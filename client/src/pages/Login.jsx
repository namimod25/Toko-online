import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Google reCAPTCHA site key dari environment
const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY || 'my'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const [isCaptchaLoaded, setIsCaptchaLoaded] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  // Load Google reCAPTCHA script
  useEffect(() => {
    const loadRecaptcha = () => {
      if (window.grecaptcha) {
        setIsCaptchaLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = `http://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`
      script.async = true
      script.defer = true
      script.onload = () => {
        setIsCaptchaLoaded(true)
        console.log('reCAPTCHA script loaded')
      }
      script.onerror = () => {
        console.error('Failed to load reCAPTCHA script')
        setIsCaptchaLoaded(false)
      }
      document.head.appendChild(script)
    }

    loadRecaptcha()

    // Check if user previously selected remember me
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

  const executeRecaptcha = async () => {
    if (!window.grecaptcha) {
      throw new Error('reCAPTCHA not loaded')
    }

    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {
            action: 'login'
          })
          resolve(token)
        } catch (error) {
          reject(error)
        }
      })
    })
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
      let captchaToken = recaptchaToken

      // Jika di production atau token belum ada, execute reCAPTCHA
      if (process.env.NODE_ENV === 'production' || !captchaToken) {
        if (!isCaptchaLoaded) {
          throw new Error('reCAPTCHA is still loading. Please try again.')
        }
        captchaToken = await executeRecaptcha()
        setRecaptchaToken(captchaToken)
      }

      console.log('Attempting login with CAPTCHA...')
      
      // Gunakan endpoint login dengan CAPTCHA
      const response = await fetch('/api/login-with-captcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: rememberMe,
          recaptchaToken: captchaToken
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Login failed')
      }

      // Reset reCAPTCHA setelah success (cek keberadaan method reset)
      if (window.grecaptcha && typeof window.grecaptcha.reset === 'function') {
        window.grecaptcha.reset()
      }

      // Update auth context
      const loginResult = await login(formData.email, formData.password, rememberMe)
      
      if (loginResult.success) {
        navigate('/')
      } else {
        setErrors({ submit: loginResult.error })
      }

    } catch (error) {
      console.error('Login error:', error)
      setErrors({ 
        submit: error.message || 'Login failed. Please try again.' 
      })
      
      // Reset reCAPTCHA pada error (cek keberadaan method reset)
      if (window.grecaptcha && typeof window.grecaptcha.reset === 'function') {
        window.grecaptcha.reset()
      }
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
              <div className="flex items-center justify-between">
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
              </div>

              {/* reCAPTCHA Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Verification
                </label>
                <div className="flex justify-center">
                  {isCaptchaLoaded ? (
                    <div 
                      className="g-recaptcha"
                      data-sitekey={RECAPTCHA_SITE_KEY}
                      data-size="normal"
                      data-theme="light"
                    ></div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-4 text-center">
                      <p className="text-gray-600 text-sm">
                        Loading security check...
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  This helps us prevent automated login attempts
                </p>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{errors.submit}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading || (process.env.NODE_ENV === 'production' && !isCaptchaLoaded)}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </div>
                  ) : (
                    'Sign in to your account'
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

          {/* Footer dengan info security */}
          <div className="bg-gray-50 py-4 px-8 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Protected by reCAPTCHA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Security Info */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Secure login with CAPTCHA protection
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login