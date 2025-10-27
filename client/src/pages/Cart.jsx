import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Rupiah } from '../utils/Currency'

const Cart = () => {
    const { user } = useAuth()

    if (!user) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Please login to view your cart
                </h2>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
            <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600">Your cart is empty</p>
            </div>
        </div>
    )
}

export default Cart