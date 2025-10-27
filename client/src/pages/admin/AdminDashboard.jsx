import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  BarChart3,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

const AdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({})
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/')
      return
    }
    fetchDashboardData()
  }, [user, navigate])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/orders/recent')
      ])

      setStats(statsRes.data)
      setRecentOrders(ordersRes.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600">Hanya administrator yang diperbolehkan
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      icon: ShoppingCart,
      color: 'blue'
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers || 0,
      icon: Users,
      color: 'purple'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts || 0,
      icon: Package,
      color: 'orange'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full bg-${card.color}-100`}>
                    <Icon className={`h-6 w-6 text-${card.color}-600`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart Placeholder */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">Revenue Overview</h3>
            </div>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-12 w-12 text-gray-400" />
              <p className="text-gray-500 ml-2">Chart will be implemented here</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <ShoppingCart className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold">Recent Orders</h3>
            </div>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">${order.total} • {order.status}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent orders</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Manage Products
          </button>
          <button
            onClick={() => navigate('/admin/orders')}
            className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-300"
          >
            View All Orders
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-300"
          >
            Manage Users
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard