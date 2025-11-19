import { Server } from 'socket.io'
// import prisma from '../config/database.js'

let io

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  })

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('join-admin-room', () => {
      socket.join('admin-room')
      console.log('Admin joined admin room:', socket.id)
    })

    // room untuk product updates
    socket.on('join-product-room', (productId) => {
      socket.join(`product-${productId}`)
      console.log(`User joined product room: product-${productId}`)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!')
  }
  return io
}


export const emitProductUpdate = (product) => {
  const io = getIO()
  io.emit('product-updated', product)
  io.to(`product-${product.id}`).emit('product-detail-updated', product)
  io.to('admin-room').emit('admin-product-updated', product)
}

export const emitProductCreated = (product) => {
  const io = getIO()
  io.emit('product-created', product)
  io.to('admin-room').emit('admin-product-created', product)
}

export const emitProductDeleted = (productId) => {
  const io = getIO()
  io.emit('product-deleted', productId)
  io.to(`product-${productId}`).emit('product-detail-deleted', productId)
  io.to('admin-room').emit('admin-product-deleted', productId)
}

export const emitStockUpdate = (productId, newStock) => {
  const io = getIO()
  io.emit('stock-updated', { productId, stock: newStock })
  io.to(`product-${productId}`).emit('product-stock-updated', { productId, stock: newStock })
  io.to('admin-room').emit('admin-stock-updated', { productId, stock: newStock })
}