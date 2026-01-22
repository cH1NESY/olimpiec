import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear auth data, don't redirect automatically
      // Let components handle redirects if needed
      const token = localStorage.getItem('auth_token')
      if (token) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        // Only redirect if we're on a protected page
        const protectedPaths = ['/profile', '/checkout']
        const currentPath = window.location.pathname
        if (protectedPaths.some(path => currentPath.startsWith(path))) {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// Products API
export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params })
  return response.data
}

export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`)
  return response.data
}

export const getCategories = async () => {
  const response = await api.get('/categories')
  return response.data
}

export const searchProducts = async (query) => {
  const response = await api.get('/products/search', { params: { q: query } })
  return response.data
}

// Cart API
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData)
  return response.data
}

// Auth API
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials)
  if (response.data.success && response.data.data.token) {
    localStorage.setItem('auth_token', response.data.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.data.user))
  }
  return response.data
}

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData)
  if (response.data.success && response.data.data.token) {
    localStorage.setItem('auth_token', response.data.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.data.user))
  }
  return response.data
}

export const logout = async () => {
  try {
    await api.post('/auth/logout')
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }
}

export const getUser = async () => {
  const response = await api.get('/auth/user')
  if (response.data.success && response.data.data) {
    localStorage.setItem('user', JSON.stringify(response.data.data))
  }
  return response.data
}

export const updateProfile = async (userData) => {
  const response = await api.put('/auth/user', userData)
  if (response.data.success && response.data.data) {
    localStorage.setItem('user', JSON.stringify(response.data.data))
  }
  return response.data
}

export const getAuthToken = () => {
  return localStorage.getItem('auth_token')
}

export const getStoredUser = () => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

// Stores API
export const getStores = async () => {
  const response = await api.get('/stores')
  return response.data
}

export default api
