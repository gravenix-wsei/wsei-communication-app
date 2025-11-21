<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import type { ChatUser } from '@/stores/chatStore'

const chatStore = useChatStore()
const authStore = useAuthStore()

const users = computed(() =>chatStore.users.filter(user => user._id !== authStore.user?.id))
const selectedUserId = computed(() => chatStore.selectedUserId)
const isLoading = computed(() => chatStore.loading)

const handleSelectUser = (user: ChatUser) => {
  chatStore.loadMessages(user._id)
}

const displayName = (user: ChatUser) => {
  return user.nickname || user.email.split('@')[0]
}
</script>

<template>
  <div class="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-lg font-bold text-gray-800">Contacts</h2>
    </div>

    <!-- Users list -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="isLoading" class="p-4 text-center text-gray-400">
        Loading...
      </div>
      <div v-else-if="users.length === 0" class="p-4 text-center text-gray-400">
        No users available
      </div>
      <button
        v-for="user in users"
        :key="user._id"
        @click="handleSelectUser(user)"
        :class="[
          'w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition',
          selectedUserId === user._id ? 'bg-blue-100 border-l-4 border-blue-500' : ''
        ]"
      >
        <div class="font-medium text-gray-800">
          {{ displayName(user) }}
        </div>
        <div class="text-sm text-gray-500">
          {{ user.email }}
        </div>
      </button>
    </div>
  </div>
</template>
