import React from 'react'
import LoadingSpinner from '../UI/LoadingSpinner'
import SuccessCheckmark from '../UI/SuccessCheckmark'

const LogoutModal = ({ isOpen, status, message }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4">

                    {/* Loading Spinner */}
                    {status === 'loading' && (
                        <>
                            <LoadingSpinner size="large" />
                            <p className="text-gray-600 text-lg">Logging out...</p>
                        </>
                    )}

                    {/* Success Checkmark */}
                    {status === 'success' && (
                        <>
                            <SuccessCheckmark size="large" />
                            <p className="text-green-600 text-lg font-semibold">{message}</p>
                        </>
                    )}

                    {/* Error */}
                    {status === 'error' && (
                        <>
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                            <p className="text-red-600 text-lg">{message}</p>
                        </>
                    )}

                </div>
            </div>
        </div>
    )
}

export default LogoutModal