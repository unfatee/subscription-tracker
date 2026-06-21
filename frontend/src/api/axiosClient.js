import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 15000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('access_token')) {
      localStorage.removeItem('access_token')
      window.dispatchEvent(new Event('auth:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export const errorMessage = (error) => {
  const detail = error.response?.data?.detail
  if (Array.isArray(detail)) return detail.map((item) => item.msg).join('. ')
  return detail || error.message || 'Something went wrong. Please try again.'
}

export default client
