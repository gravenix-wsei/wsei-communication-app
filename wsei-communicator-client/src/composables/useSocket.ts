import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'

let socket: Socket | null = null
let isConnected = ref(false)

export const useSocket = () => {
  const connect = (token: string) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    
    if (socket?.connected) {
      console.log('Socket already connected')
      return
    }

    socket = io(API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    })

    socket.on('connect', () => {
      console.log('Socket connected successfully')
      isConnected.value = true
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      isConnected.value = false
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })
  }

  const disconnect = () => {
    if (socket?.connected) {
      socket.disconnect()
      isConnected.value = false
    }
  }

  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socket) {
      socket.on(event, callback)
    }
  }

  const off = (event: string, callback: (...args: any[]) => void) => {
    if (socket) {
      socket.off(event, callback)
    }
  }

  const emit = (event: string, data?: any) => {
    if (socket?.connected) {
      socket.emit(event, data)
      console.log(`Emitted event: ${event}`, data)
    } else {
      console.warn(`Cannot emit ${event} - socket not connected`)
    }
  }

  return {
    isConnected,
    connect,
    disconnect,
    on,
    off,
    emit
  }
}
