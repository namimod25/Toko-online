import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ShoppingBag, Truck, Shield, ArrowRight } from 'lucide-react'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to OnlineStore
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Discover amazing products at great prices
            </p>
            <Link
              to="/products"
              className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
            >
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
     

      {/* CTA Section */}
      {!user && (
        <section className="py-16 bg-gray-100">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to start shopping?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Create an account today and enjoy exclusive benefits
            </p>
            <div className="space-x-4">
              <Link
                to="/register"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
              >
                Sign Up Free
              </Link>
              <Link
                to="/login"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition duration-300"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home