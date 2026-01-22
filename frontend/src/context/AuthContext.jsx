import { createContext, useContext, useState, useEffect } from 'react'
import { getUser, getStoredUser, logout as apiLogout } from '../api/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to get user from localStorage first
    const storedUser = getStoredUser()
    const token = localStorage.getItem('auth_token')
    
    if (storedUser && token) {
      setUser(storedUser)
      setLoading(false)
      // Then try to fetch from API to verify token
      loadUser()
    } else {
      setUser(null)
      setLoading(false)
    }
  }, [])

  const loadUser = async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const response = await getUser()
      if (response.success && response.data) {
        setUser(response.data)
      } else {
        setUser(null)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
      }
    } catch (error) {
      // If 401, user is not authenticated - clear data
      if (error.response?.status === 401) {
        setUser(null)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
      } else {
        console.error('Error loading user:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const login = (userData) => {
    setUser(userData)
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
