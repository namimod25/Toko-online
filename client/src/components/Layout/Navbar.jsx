import React, { useState, useEffect } from 'react'
import { Link, useNavigate, NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ShoppingCart, LogOut, Menu } from 'lucide-react'
import axios from 'axios'

const Navbar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
    const [cartCount, setCartCount] = useState(0)

    useEffect(() => {
        if (user) {
            fetchCartCount()
        }
    }, [user])

    const fetchCartCount = async () => {
        try {
            const response = await axios.get('/api/cart')
            const count = response.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
            setCartCount(count)
        } catch (error) {
            console.error('Error fetching cart count:', error)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/')
        setIsMobileMenuOpen(false)
    }

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-xl font-bold text-blue-600">
                            TokoOnline
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                            Home
                        </Link>
                        <Link to="/cart" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md transition duration-200 relative">
                            <ShoppingCart className="h-6 w-6" />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] items-center justify-center font-bold rounded-full h-4 w-4 flex">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/customer/dashboard" className="text-gray-600 hover:text-gray-800 transition duration-200">
                                    My Account
                                </Link>
                                {user.role === 'ADMIN' && (
                                    <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                        Admin Dashboard
                                    </Link>
                                )}
                                <button onClick={handleLogout} className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                {/* <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                    Login
                                </Link> */}
                                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden pb-3">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                            <Link to="/" className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                Home
                            </Link>
                            {user ? (
                                <>
                                    <Link to="/profile" className="text-gray-600 hover:text-gray-800 transition duration-200">
                                        My Profile
                                    </Link>
                                    <NavLink to="/products" className={({ isActive }) =>
                                        `transition duration-200 ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-800'}`
                                    }
                                    >
                                        Products
                                    </NavLink>
                                    <Link to="/cart" className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                        <ShoppingCart className="h-5 w-5 mr-2" />
                                        Cart
                                    </Link>
                                    {user.role === 'ADMIN' && (
                                        <Link to="/admin/dashboard" className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <button onClick={handleLogout} className="block w-full text-left text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-base font-medium">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* <Link to="/login" className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                        Login
                                    </Link> */}
                                    <Link to="/register" className="block bg-blue-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700" onClick={() => setIsMobileMenuOpen(false)}>
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
