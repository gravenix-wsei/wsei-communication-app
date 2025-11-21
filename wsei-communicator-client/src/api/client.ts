import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true // This ensures cookies are sent with all requests
})

// Add token to request cookies if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    const apiUrl = new URL(API_BASE_URL)
    document.cookie = `token=${token}; path=/; domain=${apiUrl.hostname}`
  }
  return config
})

export default apiClient
