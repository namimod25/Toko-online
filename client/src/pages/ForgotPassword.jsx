import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import axios from 'axios'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [errors, setErrors] = useState({})

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})

        try {
            const response = await axios.post('/api/password/forgot-password', { email })

            setSuccess(true)
        } catch (error) {
            setErrors({
                submit: error.response?.data?.error || 'Failed to send reset email'
            })
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                        <div className="bg-green-600 py-6 px-8">
                            <div className="text-center">
                                <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-white">Check Your Email</h2>
                            </div>
                        </div>

                        <div className="py-8 px-8 text-center">
                            <p className="text-gray-600 mb-6">
                                If an account with <strong>{email}</strong> exists, we've sent a password reset link to your email.
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                The link will expire in 1 hour for security reasons.
                            </p>

                            <div className="space-y-4">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Login
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
                            <h2 className="text-2xl font-bold text-white">Reset Your Password</h2>
                            <p className="text-blue-100 text-sm mt-2">
                                Enter your email to receive a reset link
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
                                        placeholder="Enter your email"
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
                                    {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
                                </button>
                            </div>

                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Login
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