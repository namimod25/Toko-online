import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:5000'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      })

      this.socket.on('connect', () => {
        console.log('Connected to server')
        this.isConnected = true
      })

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server')
        this.isConnected = false
      })

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error)
        this.isConnected = false
      })
    }
    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  getSocket() {
    return this.socket
  }
}

export const socketService = new SocketService()