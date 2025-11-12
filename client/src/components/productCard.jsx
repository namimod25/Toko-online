import React, { useState, useEffect } from 'react';

const ProductCard = ({ product }) => {
  const [currentProduct, setCurrentProduct] = useState(product);

  // Update product data if prop changes (from real-time updates)
  useEffect(() => {
    setCurrentProduct(product);
  }, [product]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <img 
        src={currentProduct.image || '/images/placeholder.jpg'} 
        alt={currentProduct.name}
        className="w-full h-48 object-cover"
      />
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {currentProduct.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {currentProduct.description}
        </p>
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-xl font-bold text-blue-600">
            {formatPrice(currentProduct.price)}
          </span>
          
          {/* Stock indicator dengan update real-time */}
          <span className={`text-sm px-2 py-1 rounded ${
            currentProduct.stock > 10 
              ? 'bg-green-100 text-green-800' 
              : currentProduct.stock > 0 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-red-100 text-red-800'
          }`}>
            {currentProduct.stock > 0 
              ? `${currentProduct.stock} tersedia` 
              : 'Habis'
            }
          </span>
        </div>

        <button 
          className={`w-full py-2 px-4 rounded font-medium ${
            currentProduct.stock > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={currentProduct.stock === 0}
        >
          {currentProduct.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;