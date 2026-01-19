import midtransClient from 'midtrans-client'

export const snap = new midtransClient.Snap({
    isProduction: false, //sandbox
    serverKey: process.env.MIDTRANS_SERVER_KEY || "sb5000",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "sb3000"
})

// Create Core API instance (transaction status)
export const core = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-Your-Server-Key',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-Your-Client-Key'
})

// Test credentials (sandbox)
export const MIDTRANS_CONFIG = {
  isProduction: false,
  serverKey: 'SB-Mid-server-Your-Server-Key',
  clientKey: 'SB-Mid-client-Your-Client-Key'
}

// nomor pesanan
export const generateOrderNumber = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `ORD-${year}${month}${day}-${random}`
}