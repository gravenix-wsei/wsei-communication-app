<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore } from '@/stores/chatStore'
import { useSocket } from '@/composables/useSocket'
import UserSidebar from '@/components/UserSidebar.vue'
import MessageDisplay from '@/components/MessageDisplay.vue'
import MessageInput from '@/components/MessageInput.vue'

const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()
const { connect, disconnect } = useSocket()

onMounted(async () => {
  // Connect Socket.IO
  if (authStore.token) {
    connect(authStore.token)
  }

  // Fetch users and messages
  await chatStore.fetchUsers()
})

onUnmounted(() => {
  disconnect()
})

const handleLogout = () => {
  authStore.logout()
  chatStore.clearMessages()
  disconnect()
  router.push('/login')
}
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <!-- Top navbar -->
    <nav class="bg-white border-b border-gray-200 shadow-sm">
      <div class="px-6 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800">Chat Application</h1>
        <div class="flex items-center gap-4">
          <span class="text-gray-600">{{ authStore.user?.email }}</span>
          <button
            @click="handleLogout"
            class="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar with users -->
      <UserSidebar />

      <!-- Chat area -->
      <div class="flex-1 flex flex-col">
        <!-- Messages display -->
        <MessageDisplay />

        <!-- Message input -->
        <MessageInput />
      </div>
    </div>
  </div>
</template>
