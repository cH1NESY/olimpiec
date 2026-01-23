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

export const getBrands = async () => {
  const response = await api.get('/brands')
  return response.data
}

export const getSizes = async () => {
  const response = await api.get('/sizes')
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

// Payment API
export const createPayment = async (orderId) => {
  const response = await api.post('/payments/create', { order_id: orderId })
  return response.data
}

export const checkPaymentStatus = async (orderId) => {
  const response = await api.get(`/payments/status/${orderId}`)
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

// Reviews API
export const getProductReviews = async (productId, params = {}) => {
  const response = await api.get(`/products/${productId}/reviews`, { params })
  return response.data
}

export const checkCanReview = async (productId) => {
  try {
    // Try to get user's orders with this product
    const response = await api.get(`/products/${productId}/can-review`)
    return response.data
  } catch (error) {
    return { success: false, can_review: false }
  }
}

export const createProductReview = async (productId, reviewData) => {
  const response = await api.post(`/products/${productId}/reviews`, reviewData)
  return response.data
}

// Admin API
export const adminGetProducts = async (params = {}) => {
  const response = await api.get('/admin/products', { params })
  return response.data
}

export const adminGetProduct = async (id) => {
  const response = await api.get(`/admin/products/${id}`)
  return response.data
}

export const adminCreateProduct = async (productData) => {
  const response = await api.post('/admin/products', productData)
  return response.data
}

export const adminUpdateProduct = async (id, productData) => {
  const response = await api.put(`/admin/products/${id}`, productData)
  return response.data
}

export const adminDeleteProduct = async (id) => {
  const response = await api.delete(`/admin/products/${id}`)
  return response.data
}

export const adminGetCategories = async () => {
  const response = await api.get('/admin/categories')
  return response.data
}

export const adminCreateCategory = async (categoryData) => {
  const response = await api.post('/admin/categories', categoryData)
  return response.data
}

export const adminUpdateCategory = async (id, categoryData) => {
  const response = await api.put(`/admin/categories/${id}`, categoryData)
  return response.data
}

export const adminDeleteCategory = async (id) => {
  const response = await api.delete(`/admin/categories/${id}`)
  return response.data
}

export const adminGetBrands = async () => {
  const response = await api.get('/admin/brands')
  return response.data
}

export const adminCreateBrand = async (brandData) => {
  const response = await api.post('/admin/brands', brandData)
  return response.data
}

export const adminUpdateBrand = async (id, brandData) => {
  const response = await api.put(`/admin/brands/${id}`, brandData)
  return response.data
}

export const adminDeleteBrand = async (id) => {
  const response = await api.delete(`/admin/brands/${id}`)
  return response.data
}

export const adminGetOrders = async (params = {}) => {
  const response = await api.get('/admin/orders', { params })
  return response.data
}

export const adminGetOrder = async (id) => {
  const response = await api.get(`/admin/orders/${id}`)
  return response.data
}

export const adminUpdateOrderStatus = async (id, status) => {
  const response = await api.put(`/admin/orders/${id}/status`, { status })
  return response.data
}

export default api
