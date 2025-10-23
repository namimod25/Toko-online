import React from 'react'

const SuccessCheckmark = ({ size = 'medium', className = '' }) => {
    const sizeClasses = {
        small: 'h-6 w-6',
        medium: 'h-8 w-8',
        large: 'h-12 w-12'
    }

    return (
        <div className={`flex items-center justify-center ${sizeClasses[size]} ${className}`}>
            <svg
                className="w-full h-full text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                />
            </svg>
        </div>
    )
}

export default SuccessCheckmark