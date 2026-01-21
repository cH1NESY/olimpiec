import { useState, useEffect } from 'react'
import { getUser } from '../api/api'
import './Profile.css'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    setLoading(true)
    try {
      const data = await getUser()
      setUser(data.data || data)
    } catch (error) {
      console.error('Error loading user:', error)
      // Mock data for development
      setUser({
        id: 1,
        name: 'Иван Иванов',
        email: 'ivan@example.com',
        phone: '+7 (999) 123-45-67'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="profile-title">Личный кабинет</h1>
        <div className="profile-content">
          <div className="profile-tabs">
            <button
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Профиль
            </button>
            <button
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Заказы
            </button>
          </div>

          <div className="profile-main">
            {activeTab === 'profile' && (
              <div className="profile-section">
                <h2 className="section-title">Личные данные</h2>
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
                </div>
                <button className="btn btn-primary">Редактировать профиль</button>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="profile-section">
                <h2 className="section-title">История заказов</h2>
                <div className="orders-list">
                  <div className="order-item">
                    <div className="order-header">
                      <div className="order-info">
                        <span className="order-number">Заказ №12345</span>
                        <span className="order-date">15.12.2024</span>
                      </div>
                      <span className="order-status status-processing">В обработке</span>
                    </div>
                    <div className="order-items">
                      <div className="order-item-product">
                        <span>Футбольный мяч × 1</span>
                        <span>2 500 ₽</span>
                      </div>
                    </div>
                    <div className="order-footer">
                      <span className="order-total">Итого: 2 500 ₽</span>
                      <button className="btn btn-outline">Подробнее</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
