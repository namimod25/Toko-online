import ProductDescription from './Product/ProductDescription';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 font-bold text-xl mb-2">
          ${product.price}
        </p>
        
        {/* Product Description dengan Show More */}
        <ProductDescription description={product.description} />
        
        <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-200">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;