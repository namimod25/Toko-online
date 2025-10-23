import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ShoppingCart, User, LogOut, Menu } from 'lucide-react'

const Navbar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

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
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <ShoppingCart className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-800">OnlineStore</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                            Home
                        </Link>
                        <Link to="/products" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                            Products
                        </Link>
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/profile" className="flex items-center text-gray-700 hover:text-blue-600">
                                    <User className="h-5 w-5 mr-1" />
                                    {user.name}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center text-gray-700 hover:text-red-600"
                                >
                                    <LogOut className="h-5 w-5 mr-1" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                                    Register
                                </Link>
                                {user && user.role === 'ADMIN' && (
                                    <Link to="/admin/products" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                        Admin Dashboard
                                    </Link>
                                )}
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
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                            <Link
                                to="/"
                                className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                to="/products"
                                className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Products
                            </Link>

                            {user ? (
                                <>
                                    <Link
                                        to="/profile"
                                        className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-base font-medium"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        {...user && user.role === 'ADMIN' && (
                                            <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                                Admin Dashboard
                                            </Link>
                                        )}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="block bg-blue-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
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