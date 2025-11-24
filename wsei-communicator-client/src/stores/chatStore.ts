import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import apiClient from '@/api/client'
import { useSocket } from '@/composables/useSocket'

export interface ChatUser {
  _id: string
  email: string
  nickname?: string
}

export interface Message {
  _id: string
  sender: string
  recipient: string
  content: string
  createdAt: string
}

export const useChatStore = defineStore('chat', () => {
  const users = ref<ChatUser[]>([])
  const messages = ref<Message[]>([])
  const selectedUserId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const socketInitialized = ref(false)
  const typingUsers = ref<Set<string>>(new Set())
  const typingTimeouts = new Map<string, number>()

  const selectedUser = computed(() => users.value.find(u => u._id === selectedUserId.value))
  const sortedMessages = computed(() => [...messages.value].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  ))

  const initializeSocketListeners = () => {
    if (socketInitialized.value) return
    
    const { on } = useSocket()
    
    on('message:receive', (message: Message) => {
      console.log('Received message via Socket.IO:', message)
      addMessage(message)
    })
    
    on('user:typing', ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      console.log('Received user:typing event:', { userId, isTyping })
      if (isTyping) {
        setUserTyping(userId)
      } else {
        clearUserTyping(userId)
      }
    })
    
    socketInitialized.value = true
  }

  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/api/users')
      users.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch users'
      console.error('Failed to fetch users:', err)
    } finally {
      loading.value = false
    }
  }

  const loadMessages = async (userId: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/api/messages/load', {
        params: { userId }
      })
      messages.value = response.data
      selectedUserId.value = userId
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to load messages'
      console.error('Failed to load messages:', err)
    } finally {
      loading.value = false
    }
  }

  const addMessage = (message: Message) => {
    // Prevent duplicate messages
    if (!messages.value.find(m => m._id === message._id)) {
      messages.value.push(message)
    }
  }

  const setUserTyping = (userId: string) => {
    console.log('setUserTyping called for userId:', userId)
    // Clear existing timeout if any
    const existingTimeout = typingTimeouts.get(userId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }
    
    // Add user to typing set
    typingUsers.value.add(userId)
    
    // Set new timeout to clear typing indicator after 3 seconds
    const timeout = setTimeout(() => {
      console.log('Auto-clearing typing for userId:', userId)
      typingUsers.value.delete(userId)
      typingTimeouts.delete(userId)
    }, 1500)
    
    typingTimeouts.set(userId, timeout)
  }

  const clearUserTyping = (userId: string) => {
    console.log('clearUserTyping called for userId:', userId)
    const timeout = typingTimeouts.get(userId)
    if (timeout) {
      clearTimeout(timeout)
      typingTimeouts.delete(userId)
    }
    typingUsers.value.delete(userId)
  }

  const clearAllTyping = () => {
    console.log('clearAllTyping called')
    // Clear all timeouts
    typingTimeouts.forEach(timeout => clearTimeout(timeout))
    typingTimeouts.clear()
    typingUsers.value.clear()
  }

  const clearMessages = () => {
    messages.value = []
    selectedUserId.value = null
    clearAllTyping()
  }

  return {
    users,
    messages,
    selectedUserId,
    selectedUser,
    sortedMessages,
    loading,
    error,
    typingUsers,
    fetchUsers,
    loadMessages,
    addMessage,
    setUserTyping,
    clearUserTyping,
    clearAllTyping,
    clearMessages,
    initializeSocketListeners
  }
})
