import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Layout/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import Profile from './pages/Profile'
import Cart from './pages/Cart'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import LandingPage from './pages/LandingPage'
import ForgotPassword from './pages/ForgotPassword'
import HeroSlides from './pages/admin/HeroSlides'
import ResetPassword from './pages/ResetPassword'
import ProductCard from './components/productCard'
import './index.css'



function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className='container mx-auto px-4 py-8'>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path='forgot-password' element={<ForgotPassword />} />
              <Route path='reset-password' element={<ResetPassword />} />
              <Route path="/products" element={<Products />} />
              <Route path='/product-card' element={<ProductCard />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
              <Route path='/admin/dashboard' element={<AdminDashboard />} />
              <Route path='/admin/hero-slide' element={<HeroSlides />} />
              <Route path='/admin/products' element={<AdminProducts />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App