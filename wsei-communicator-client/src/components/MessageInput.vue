<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useSocket } from '@/composables/useSocket'
import apiClient from '@/api/client'

const chatStore = useChatStore()
const { emit, isConnected } = useSocket()

const content = ref('')
const loading = ref(false)

const selectedUserId = computed(() => chatStore.selectedUserId)
const canSend = computed(() => content.value.trim().length > 0 && !loading.value)

const handleSend = async () => {
  if (!canSend.value || !selectedUserId.value) return

  loading.value = true
  const message = content.value.trim()
  content.value = ''

  try {
    // Send via REST API as primary method
    const response = await apiClient.post('/api/messages/send', {
      recipientId: selectedUserId.value,
      content: message
    })

    // Add message to store immediately
    chatStore.addMessage(response.data)

    // Also emit via Socket.IO if connected
    if (isConnected.value) {
      emit('message:send', {
        recipientId: selectedUserId.value,
        content: message
      })
    }
  } catch (err) {
    console.error('Failed to send message:', err)
    content.value = message // Restore message on error
  } finally {
    loading.value = false
  }
}
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
