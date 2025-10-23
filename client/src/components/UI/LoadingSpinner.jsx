import React from 'react'

const SpinnerLoading = ({ size = 'medium', className = '' }) => {
    const sizeClasses = {
        small: 'h-6 w-6',
        medium: 'h-8 w-8',
        large: 'h-12 w-12'
    }

    return (
        <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]} ${className}`}></div>
    )
}

export default SpinnerLoading