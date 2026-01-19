import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Key, Copy } from 'lucide-react'
import axios from 'axios'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resetData, setResetData] = useState(null)
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const response = await axios.post('/api/password/forgot-password', { email })
      
      setResetData(response.data)
      setSuccess(true)
    } catch (error) {
      setErrors({ 
        submit: error.response?.data?.error || 'Gagal membuat token reset' 
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
  
  navigator.clipboard.writeText(text)
    .then(() => {
      alert('Token berhasil disalin')
    })
    .catch(err => {
      console.error('Failed to copy:', err)
      alert('Gagal menyalin token. Silakan copy manual.')
    })
}

  if (success && resetData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-green-600 py-6 px-8">
              <div className="text-center">
                <Key className="h-16 w-16 text-white mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white">Reset Token Berhasil Dibuat</h2>
              </div>
            </div>
            
            <div className="py-8 px-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  <strong>Development Mode:</strong> Token akan ditampilkan di bawah ini.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-gray-900">{resetData.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Token Expires
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-50 p-3 rounded-lg border font-mono text-sm break-all">
                      {resetData.resetToken}
                    </div>
                    <button
                    onClick={() => copyToClipboard(resetData.resetToken)}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-200"
                    title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Link
                  to={`/reset-password?token=${resetData.resetToken}&email=${encodeURIComponent(resetData.email)}`}
                  className="block w-full text-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                >
                  Lanjut ke Reset Password
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-blue-600 py-6 px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Lupa Password</h2>
              <p className="text-blue-100 text-sm mt-2">
                Masukkan email untuk mendapatkan reset token
              </p>
            </div>
          </div>

          <div className="py-8 px-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan email Anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  {loading ? 'Membuat Token...' : 'Dapatkan Reset Token'}
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

export default ForgotPassword