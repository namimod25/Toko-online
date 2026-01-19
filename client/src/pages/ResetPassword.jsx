import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Lock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import axios from 'axios'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (token && email) {
      verifyToken()
    } else {
      setValidating(false)
      setTokenValid(false)
    }
  }, [token, email])

  const verifyToken = async () => {
    setValidating(true)
    setErrors({})

    

    try {
      const response = await axios.get('/api/password/validate-reset-token', {
        params: {
          token,
          email
        }
      })

      console.log('Validation response:', response.data)
      setTokenValid(response.data.valid)

    } catch (error) {
      console.error('Validation error:', error.response?.data)
      setTokenValid(false)
      setErrors({
        submit: error.response?.data?.error || 'Token reset tidak valid'
      })
    } finally {
      setValidating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setErrors({ submit: 'Password tidak cocok' })
      return
    }

    if (formData.password.length < 6) {
      setErrors({ submit: 'Password minimal 6 karakter' })
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await axios.post('/api/password/reset-password', {
        token,
        email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      })

      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error) {
      setErrors({
        submit: error.response?.data?.error || 'Gagal mereset password'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memvalidasi token...</p>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-red-600 py-6 px-8">
              <div className="text-center">
                <XCircle className="h-16 w-16 text-white mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white">Token Tidak Valid</h2>
              </div>
            </div>

            <div className="py-8 px-8 text-center">
              <p className="text-gray-600 mb-6">
                {errors.submit || 'Token reset tidak valid atau sudah kadaluarsa.'}
              </p>
              <div className="space-y-4">
                <Link
                  to="/forgot-password"
                  className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Minta Token Baru
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-green-600 py-6 px-8">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white">Password Berhasil Direset</h2>
              </div>
            </div>

            <div className="py-8 px-8 text-center">
              <p className="text-gray-600 mb-6">
                Password Anda telah berhasil direset. Mengarahkan ke halaman login...
              </p>
              <Link
                to="/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium"
              >
                Pergi ke Login
              </Link>
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
              <h2 className="text-2xl font-bold text-white">Reset Password</h2>
              <p className="text-blue-100 text-sm mt-2">
                Buat password baru untuk {email}
              </p>
            </div>
          </div>

          <div className="py-8 px-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength="6"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan password baru"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength="6"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Konfirmasi password baru"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {errors.submit && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Mereset Password...' : 'Reset Password'}
                </button>
              </div>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword