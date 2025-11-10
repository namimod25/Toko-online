import { useState } from 'react';

const ProductDescription = ({ description, maxLength = 150 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Jika deskripsi pendek, tampilkan langsung
  if (!description || description.length <= maxLength) {
    return <p className="text-gray-600">{description}</p>;
  }

  const truncatedText = isExpanded 
    ? description 
    : `${description.substring(0, maxLength)}...`;

  return (
    <div className="product-description">
      <p className="text-gray-600 leading-relaxed">
        {truncatedText}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-600 hover:text-blue-800 font-medium mt-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        {isExpanded ? 'Show Less' : 'Show More'}
      </button>
    </div>
  );
};

export default ProductDescription;