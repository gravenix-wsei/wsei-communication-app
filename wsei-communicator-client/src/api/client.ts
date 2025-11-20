import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This ensures cookies are sent with all requests
  headers: {
    'Content-Type': 'application/json'
  }
})

export default apiClient
