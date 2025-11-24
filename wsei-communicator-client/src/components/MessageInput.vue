<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useSocket } from '@/composables/useSocket'
import { useAuthStore } from '@/stores/authStore'
import apiClient from '@/api/client'

const chatStore = useChatStore()
const authStore = useAuthStore()
const { emit, isConnected } = useSocket()

const content = ref('')
const loading = ref(false)
let typingTimeout: number | null = null
let isCurrentlyTyping = false

const selectedUserId = computed(() => chatStore.selectedUserId)
const canSend = computed(() => content.value.trim().length > 0 && !loading.value)
const currentUserId = computed(() => authStore.user?.id)

const handleSend = async () => {
  if (!canSend.value || !selectedUserId.value) return

  loading.value = true
  const message = content.value.trim()
  content.value = ''

  // Stop typing indicator immediately when sending
  stopTyping()

  try {
    // Try Socket.IO first (real-time)
    if (isConnected.value) {
      emit('message:send', {
        recipientId: selectedUserId.value,
        content: message
      })
    } else {
      // Fallback to REST API if Socket.IO not connected
      const response = await apiClient.post('/api/messages/send', {
        recipientId: selectedUserId.value,
        content: message
      })
    }
    chatStore.addMessage({
      _id: 'temp-id-' + Date.now(),
      sender: currentUserId.value || '',
      recipient: selectedUserId.value,
      content: message,
      createdAt: new Date().toISOString()
    })
  } catch (err) {
    console.error('Failed to send message:', err)
    content.value = message // Restore message on error
  } finally {
    loading.value = false
  }
}

const emitTyping = (isTyping: boolean) => {
  if (!selectedUserId.value || !isConnected.value) return
  
  emit('user:typing', {
    recipientId: selectedUserId.value,
    isTyping
  })
}

const stopTyping = () => {
  if (typingTimeout) {
    clearTimeout(typingTimeout)
    typingTimeout = null
  }
  if (isCurrentlyTyping) {
    emitTyping(false)
    isCurrentlyTyping = false
  }
}

// Watch content changes with debouncing
watch(content, (newValue) => {
  if (!newValue.trim() || !selectedUserId.value) {
    stopTyping()
    return
  }

  // Clear existing timeout
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }

  // Emit typing started (only if not already typing)
  if (!isCurrentlyTyping) {
    emitTyping(true)
    isCurrentlyTyping = true
  }

  // Set timeout to stop typing after 3 seconds
  typingTimeout = setTimeout(() => {
    stopTyping()
  }, 3000)
})

// Watch for conversation changes
watch(selectedUserId, (newUserId, oldUserId) => {
  if (oldUserId && oldUserId !== newUserId) {
    stopTyping()
  }
})

// Cleanup on unmount
onBeforeUnmount(() => {
  stopTyping()
})
</script>

<template>
  <div class="bg-white border-t border-gray-200 p-4">
    <form @submit.prevent="handleSend" class="flex gap-3">
      <input
        v-model="content"
        type="text"
        placeholder="Type a message..."
        :disabled="!selectedUserId"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        @keyup.enter="handleSend"
      />
      <button
        type="submit"
        :disabled="!canSend || !selectedUserId"
        class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium px-6 py-2 rounded-lg transition duration-200 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Sending...' : 'Send' }}
      </button>
    </form>
  </div>
</template>
