import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Rupiah } from '../utils/Currency'
import {
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react'
import axios from 'axios'

const LandingPage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [heroSlides, setHeroSlides] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { user } = useAuth()

  useEffect(() => {
    fetchLandingData()
  }, [])

  // Auto slide hero
  useEffect(() => {
    if (heroSlides.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [heroSlides.length])

  const fetchLandingData = async () => {
    try {
      setLoading(true)

      const [productsResponse, slidesResponse, categoriesResponse] = await Promise.all([
        axios.get('/api/landing/featured-products'),
        axios.get('/api/landing/hero-slides'), // Update endpoint
        axios.get('/api/landing/categories')
      ])

      setFeaturedProducts(productsResponse.data)
      setHeroSlides(slidesResponse.data) // Data dari database
      setCategories(categoriesResponse.data)

    } catch (error) {
      console.error('Error fetching landing data:', error)
      // Fallback data
      setFeaturedProducts(getMockProducts())
      setHeroSlides(getMockSlides())
      setCategories(getMockCategories())
    } finally {
      setLoading(false)
    }
  }

  const getMockCategories = () => [
    { id: 'all', name: 'All Products', count: 8 },
    { id: 'Smartphone', name: 'Smartphone', count: 4 },
    { id: 'Laptop', name: 'Laptop', count: 2 },
    { id: 'Tablet', name: 'Tablet', count: 2 }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  const filteredProducts = featuredProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="relative h-full flex items-center justify-center text-center text-white">
              <div className="max-w-4xl px-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 animate-fade-in-up">
                  {slide.description}
                </p>
                <Link
                  to={slide.buttonLink || (user ? "/products" : "/register")}
                  className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-200 transform hover:scale-105 animate-fade-in-up"
                >
                  {slide.buttonText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        {heroSlides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition duration-200"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition duration-200"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition duration-200 ${index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition duration-300 hover:scale-105"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300x200?text=No+Image"
                        }}
                      />
                      {product.stock === 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          Out of Stock
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="mb-2">
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {product.category}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-green-600">
                          {Rupiah(product.price)}
                        </span>
                        <Link
                          to={user ? "/products" : "/register"}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={product.stock === 0}
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'View Details'}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}

              {/* CTA Section */}
              <div className="text-center">
                <Link
                  to={user ? "/products" : "/register"}
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition duration-200 transform hover:scale-105"
                >
                  {user ? 'View All Products' : 'Start Shopping Now'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest updates on new products and exclusive offers
          </p>
          <div className="flex flex-col sm:flexRow gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-200">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage