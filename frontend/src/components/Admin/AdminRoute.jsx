import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const AdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login')
      } else if (!user?.is_admin) {
        navigate('/')
      }
    }
  }, [loading, isAuthenticated, user, navigate])

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  if (!isAuthenticated || !user?.is_admin) {
    return null
  }

  return children
}

export default AdminRoute
