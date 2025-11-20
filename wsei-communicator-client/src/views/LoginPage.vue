<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const nickname = ref('')
const loading = ref(false)
const errorMessage = ref('')

const toggleMode = () => {
  isLogin.value = !isLogin.value
  errorMessage.value = ''
  email.value = ''
  password.value = ''
  passwordConfirm.value = ''
  nickname.value = ''
}

const handleSubmit = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    if (isLogin.value) {
      await authStore.login(email.value, password.value)
    } else {
      await authStore.register(email.value, password.value, passwordConfirm.value, nickname.value)
    }
    
    router.push('/')
  } catch (err: any) {
    errorMessage.value = authStore.error || 'An error occurred'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">
        Chat App
      </h1>

      <div class="mb-6">
        <h2 class="text-2xl font-semibold text-gray-700 text-center">
          {{ isLogin ? 'Login' : 'Register' }}
        </h2>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Error message -->
        <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {{ errorMessage }}
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
        </div>

        <!-- Nickname (only in register mode) -->
        <div v-if="!isLogin">
          <label class="block text-sm font-medium text-gray-700 mb-1">Nickname (optional)</label>
          <input
            v-model="nickname"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your nickname"
          />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <!-- Password Confirm (only in register mode) -->
        <div v-if="!isLogin">
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            v-model="passwordConfirm"
            type="password"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          {{ loading ? 'Loading...' : isLogin ? 'Login' : 'Register' }}
        </button>
      </form>

      <!-- Toggle mode -->
      <div class="mt-6 text-center">
        <p class="text-gray-600">
          {{ isLogin ? "Don't have an account?" : 'Already have an account?' }}
          <button
            @click="toggleMode"
            class="text-blue-500 hover:text-blue-600 font-medium"
          >
            {{ isLogin ? 'Register' : 'Login' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
