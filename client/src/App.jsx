import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Layout/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import Profile from './pages/Profile'
import ChangePassword from './pages/Change-Password'
import Cart from './pages/Cart'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import LandingPage from './pages/LandingPage'
import ForgotPassword from './pages/ForgotPassword'
import HeroSlides from './pages/admin/HeroSlides'
import ResetPassword from './pages/ResetPassword'
import ProductCard from './components/productCard'
import Users from './pages/admin/Users'
import ProductDetail from './pages/ProductDetail'
import CustomerDashboard from './pages/customer/Dashboard'
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
              <Route path='/products/:id' element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path='forgot-password' element={<ForgotPassword />} />
              <Route path='reset-password' element={<ResetPassword />} />
              <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
              <Route path='/product-card' element={<ProductCard />} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/profile" element={<Profile />} />
              <Route path='/change-password' element={<ChangePassword />} />
              <Route path='/admin/dashboard' element={<AdminDashboard />} />
              <Route path='/customer/dashboard' element={<CustomerDashboard />} />
              <Route path='/admin/hero-slide' element={<HeroSlides />} />
              <Route path='/admin/products' element={<AdminProducts />} />
              <Route path='/admin/users' element={<Users />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

function app() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}

export default App