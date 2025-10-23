import React, { useEffect } from 'react'

const Toast = ({
    isVisible,
    message,
    type = 'success',
    duration = 3000,
    onClose
}) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose?.()
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [isVisible, duration, onClose])

    if (!isVisible) return null

    const typeStyles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        loading: 'bg-blue-500 text-white'
    }

    return (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
            <div className={`${typeStyles[type]} px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-64`}>
                {type === 'success' && (
                    <SuccessCheckmark size="small" />
                )}
                {type === 'loading' && (
                    <LoadingSpinner size="small" />
                )}
                {type === 'error' && (
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                        <svg
                            className="w-3 h-3 text-red-500"
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
                )}
                <span className="font-medium">{message}</span>
            </div>
        </div>
    )
}

export default Toast