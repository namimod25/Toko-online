import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Package, 
  Truck, 
  Home,
  RefreshCw
} from 'lucide-react'

const OrderStatus = () => {
  const { orderId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchOrderStatus()
      
      const interval = setInterval(fetchOrderStatus, 10000) 
      return () => clearInterval(interval)
    }
  }, [user, orderId])

  const fetchOrderStatus = async () => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`)
      setOrder(response.data)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncStatus = async () => {
    setSyncing(true)
    try {
      // Trigger manual sync dengan Midtrans
      await axios.post(`/api/payment/sync-order-status/${orderId}`, {
        status: 'PAID' 
      })
      fetchOrderStatus()
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      setSyncing(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID':
      case 'DELIVERED':
        return <CheckCircle className="h-8 w-8 text-green-500" />
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="h-8 w-8 text-red-500" />
      case 'SHIPPED':
        return <Truck className="h-8 w-8 text-blue-500" />
      case 'PROCESSING':
        return <Package className="h-8 w-8 text-yellow-500" />
      default:
        return <Clock className="h-8 w-8 text-gray-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Menunggu Pembayaran'
      case 'PROCESSING': return 'Sedang Diproses'
      case 'PAID': return 'Pembayaran Berhasil'
      case 'SHIPPED': return 'Sedang Dikirim'
      case 'DELIVERED': return 'Telah Diterima'
      case 'CANCELLED': return 'Dibatalkan'
      case 'FAILED': return 'Gagal'
      case 'REFUNDED': return 'Dikembalikan'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order status...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Tidak Ditemukan</h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Status Pesanan</h1>
              <p className="text-gray-600">Order #{order.orderNumber || order.id}</p>
            </div>
            <button
              onClick={syncStatus}
              disabled={syncing}
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Menyinkronkan...' : 'Sinkronkan Status'}
            </button>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                {getStatusIcon(order.status)}
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {getStatusText(order.status)}
                  </h3>
                  <p className="text-gray-600">
                    Terakhir update: {new Date(order.updatedAt).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              
              {order.paymentStatus && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Status Midtrans:</p>
                  <p className="font-semibold capitalize">{order.paymentStatus}</p>
                </div>
              )}
            </div>

            {/* Status tidak sinkron warning */}
            {order.paymentStatus === 'settlement' && order.status !== 'PAID' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-yellow-800 font-medium">Status Tidak Sinkron!</p>
                    <p className="text-yellow-700 text-sm">
                      Midtrans melaporkan pembayaran sukses, tapi database masih menunggu.
                      Klik "Sinkronkan Status" di atas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Detail Pesanan</h4>
                <div className="space-y-2">
                  <p><span className="text-gray-600">Total:</span> Rp {order.total.toLocaleString('id-ID')}</p>
                  <p><span className="text-gray-600">Tanggal:</span> {new Date(order.createdAt).toLocaleString('id-ID')}</p>
                  {order.shippingAddress && (
                    <p><span className="text-gray-600">Alamat:</span> {order.shippingAddress}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Items</h4>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.product.name} x {item.quantity}</span>
                      <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </button>
            
            {order.status === 'PENDING' && (
              <button
                onClick={() => window.open(`/payment/${order.id}`, '_blank')}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-200"
              >
                Lanjutkan Pembayaran
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderStatus