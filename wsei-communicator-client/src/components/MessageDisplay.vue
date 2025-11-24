<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import TypingIndicator from './TypingIndicator.vue'

const chatStore = useChatStore()
const authStore = useAuthStore()

const scrollContainer = ref<HTMLDivElement>()

const isLoading = computed(() => chatStore.loading)
const messages = computed(() => chatStore.sortedMessages)
const selectedUser = computed(() => chatStore.selectedUser)
const currentUserId = computed(() => authStore.user?.id)
const isOtherUserTyping = computed(() => 
  selectedUser.value ? chatStore.typingUsers.has(selectedUser.value._id) : false
)

const scrollToBottom = () => {
  if (scrollContainer.value) {
    setTimeout(() => {
      scrollContainer.value?.scrollTo({
        top: scrollContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    }, 0)
  }
}

onMounted(() => {
  scrollToBottom()
})

watch(messages, () => {
  scrollToBottom()
})

watch(isOtherUserTyping, () => {
  scrollToBottom()
})

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

let lastDate = ''

const shouldShowDate = (index: number) => {
  const message = messages.value[index]
  if (!message) return false
  
  if (index === 0) {
    lastDate = formatDate(message.createdAt)
    return true
  }
  const currentDate = formatDate(message.createdAt)
  const show = currentDate !== lastDate
  lastDate = currentDate
  return show
}
</script>

<template>
  <div class="flex-1 flex flex-col bg-white overflow-hidden">
    <!-- Empty state -->
    <div v-if="!selectedUser" class="flex-1 flex items-center justify-center">
      <div class="text-center text-gray-500">
        <p class="text-2xl font-semibold mb-2">No chat selected</p>
        <p>Select a user from the sidebar to start chatting</p>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-gray-400">Loading messages...</div>
    </div>

    <!-- Messages -->
    <div v-else class="flex flex-col flex-1 overflow-hidden">
      <!-- Messages container -->
      <div ref="scrollContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-if="messages.length === 0" class="flex items-center justify-center h-full">
          <p class="text-gray-400">No messages yet. Start the conversation!</p>
        </div>

        <template v-for="(message, index) in messages" :key="message._id">
          <!-- Date separator -->
          <div v-if="shouldShowDate(index)" class="flex justify-center my-2">
            <span class="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {{ formatDate(message.createdAt) }}
            </span>
          </div>

          <!-- Message -->
          <div
            :class="[
              'flex',
              message.sender === currentUserId ? 'justify-end' : 'justify-start'
            ]"
          >
            <div
              :class="[
                'max-w-xs px-4 py-2 rounded-lg break-words',
                message.sender === currentUserId
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              ]"
            >
              <p>{{ message.content }}</p>
              <p :class="['text-xs mt-1', message.sender === currentUserId ? 'text-blue-100' : 'text-gray-500']">
                {{ formatTime(message.createdAt) }}
              </p>
            </div>
          </div>
        </template>

        <!-- Typing indicator -->
        <TypingIndicator v-if="isOtherUserTyping" />
      </div>
    </div>
  </div>
</template>
