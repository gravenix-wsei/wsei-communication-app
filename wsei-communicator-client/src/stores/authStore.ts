import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import apiClient from '@/api/client'

export interface User {
  id: string
  email: string
  nickname?: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<User | null>(JSON.parse(localStorage.getItem('auth_user') || 'null'))
  const error = ref<string | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const register = async (email: string, password: string, passwordConfirm: string, nickname?: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post('/api/auth/register', {
        email,
        password,
        passwordConfirm,
        nickname
      })

      token.value = response.data.token
      user.value = response.data.user

      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('auth_user', JSON.stringify(response.data.user))

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password
      })

      token.value = response.data.token
      user.value = response.data.user

      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('auth_user', JSON.stringify(response.data.user))

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    error.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  return {
    token,
    user,
    error,
    loading,
    isAuthenticated,
    register,
    login,
    logout
  }
})
