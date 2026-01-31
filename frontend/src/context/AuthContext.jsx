import { createContext, useContext, useState, useEffect } from 'react'
import { getUser, getStoredUser, logout as apiLogout, telegramAuth } from '../api/api'
import { isTelegramWebApp, initTelegramWebApp, getTelegramInitData } from '../utils/telegram'

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

  const handleTelegramAuth = async (initData) => {
    setLoading(true)
    try {
      const response = await telegramAuth(initData)
      if (response.success && response.data.user) {
        setUser(response.data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Telegram auth error:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize Telegram Web App if running in Telegram
        if (isTelegramWebApp()) {
          initTelegramWebApp()
          
          // Try Telegram authentication
          const initData = getTelegramInitData()
          if (initData) {
            // Set timeout for Telegram auth to prevent hanging
            const authPromise = handleTelegramAuth(initData)
            const timeoutPromise = new Promise((resolve) => {
              setTimeout(() => {
                console.warn('Telegram auth timeout, continuing without auth')
                setLoading(false)
                resolve()
              }, 5000) // 5 second timeout
            })
            await Promise.race([authPromise, timeoutPromise])
            return
          }
        }

        // Try to get user from localStorage first
        const storedUser = getStoredUser()
        const token = localStorage.getItem('auth_token')
        
        if (storedUser && token) {
          setUser(storedUser)
          setLoading(false)
          // Then try to fetch from API to verify token (non-blocking)
          loadUser().catch(err => {
            console.error('Error loading user:', err)
            // Don't block app if user load fails
          })
        } else {
          setUser(null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setUser(null)
        setLoading(false)
      }
    }

    initializeAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
