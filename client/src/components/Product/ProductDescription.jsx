import React, { useState } from 'react'

const ProductDescription = ({ description, maxLength = 150 }) => {
    const [isExpanded, setIsExpanded] = useState(false)

    const shouldTruncate = description.length > maxLength
    const displayText = isExpanded ? description : description.slice(0, maxLength) + (shouldTruncate ? '...' : '')

    return (
        <div className="mb-3">
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                {displayText}
            </p>
            {shouldTruncate && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-blue-500 text-xs mt-1 hover:text-blue-600 transition duration-200"
                >
                    {isExpanded ? 'Show less' : 'Read more'}
                </button>
            )}
        </div>
    )
}

export default ProductDescription