import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateProfile as updateProfileApi } from '../api/api'
import './Profile.css'

const Profile = () => {
  const { user, loading: authLoading, isAuthenticated, login } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    password_confirmation: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [authLoading, isAuthenticated, navigate])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        password: '',
        password_confirmation: ''
      })
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Prepare data - only include fields that have values
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
      }

      // Only include password if it's provided
      if (formData.password) {
        if (formData.password !== formData.password_confirmation) {
          setError('Пароли не совпадают')
          setLoading(false)
          return
        }
        if (formData.password.length < 8) {
          setError('Пароль должен быть не менее 8 символов')
          setLoading(false)
          return
        }
        updateData.password = formData.password
        updateData.password_confirmation = formData.password_confirmation
      }

      const response = await updateProfileApi(updateData)
      
      if (response.success) {
        setSuccess('Профиль успешно обновлен')
        login(response.data) // Update user in context
        setIsEditing(false)
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          password: '',
          password_confirmation: ''
        }))
      } else {
        setError(response.message || 'Ошибка при обновлении профиля')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при обновлении профиля')
      console.error('Update profile error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError('')
    setSuccess('')
    // Reset form to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        password: '',
        password_confirmation: ''
      })
    }
  }

  if (authLoading) {
    return <div className="loading">Загрузка...</div>
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="profile-title">Личный кабинет</h1>
        <div className="profile-content">
          <div className="profile-main">
            <div className="profile-section">
              <div className="profile-section-header">
                <h2 className="section-title">Личные данные</h2>
                {!isEditing && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Редактировать профиль
                  </button>
                )}
              </div>

              {error && (
                <div className="profile-message profile-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="profile-message profile-success">
                  {success}
                </div>
              )}

              {isEditing ? (
                <form className="profile-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Имя *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Телефон</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+7 (999) 123-45-67"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Адрес</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Введите ваш адрес"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Новый пароль (оставьте пустым, если не хотите менять)</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Минимум 8 символов"
                      disabled={loading}
                    />
                  </div>

                  {formData.password && (
                    <div className="form-group">
                      <label htmlFor="password_confirmation">Подтвердите новый пароль</label>
                      <input
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleInputChange}
                        placeholder="Повторите пароль"
                        disabled={loading}
                      />
                    </div>
                  )}

                  <div className="profile-form-actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info">
                  <div className="info-row">
                    <span className="info-label">Имя:</span>
                    <span className="info-value">{user?.name || 'Не указано'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{user?.email || 'Не указано'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Телефон:</span>
                    <span className="info-value">{user?.phone || 'Не указано'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Адрес:</span>
                    <span className="info-value">{user?.address || 'Не указано'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
