import React,{useState,useEffect} from 'react'
import socketServices from '../services/socketServices'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ShoppingBag, Truck, Shield, ArrowRight } from 'lucide-react'

const Home = () => {

  const { user } = useAuth()
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    // Load initial products
    loadProducts();

    // Setup socket connection
    socketServices.connect();

    // Listen for product updates
    socketServices.onProductUpdate(handleProductUpdate);

    // Cleanup on component unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductUpdate = (update) => {
    console.log('Product update received:', update);
    
    setProducts(prevProducts => {
      switch (update.type) {
        case 'create':
          // Add new product to the beginning
          return [update.data, ...prevProducts];

        case 'update':
          // Update existing product
          return prevProducts.map(product =>
            product._id === update.data._id ? update.data : product
          );

        case 'delete':
          // Remove deleted product
          return prevProducts.filter(product =>
            product._id !== update.data._id
          );

        default:
          return prevProducts;
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }


 return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Produk Terbaru</h1>
      
      {/* Real-time indicator */}
      <div className="flex items-center mb-4 text-green-600">
        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse mr-2"></div>
        <span className="text-sm">Live Updates</span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Belum ada produk tersedia</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard 
              key={product._id} 
              product={product} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;