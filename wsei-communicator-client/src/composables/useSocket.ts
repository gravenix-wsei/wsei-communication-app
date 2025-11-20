import { io, Socket } from 'socket.io-client'
import { ref, onUnmounted } from 'vue'

let socket: Socket | null = null

export const useSocket = () => {
  const isConnected = ref(false)

  const connect = (token: string) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    
    if (socket?.connected) {
      return
    }

    socket = io(API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })

    socket.on('connect', () => {
      console.log('Socket connected')
      isConnected.value = true
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      isConnected.value = false
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
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
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    connect,
    disconnect,
    on,
    off,
    emit
  }
}
