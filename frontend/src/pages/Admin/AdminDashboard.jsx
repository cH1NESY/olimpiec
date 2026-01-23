import { useEffect, useState } from 'react'
import { adminGetOrders, adminGetProducts } from '../../api/api'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        adminGetProducts({ per_page: 1 }),
        adminGetOrders({ per_page: 1 })
      ])

      const allOrdersRes = await adminGetOrders()
      const pendingOrders = allOrdersRes.data?.filter(order => order.status === 'pending') || []

      setStats({
        totalProducts: productsRes.meta?.total || 0,
        totalOrders: ordersRes.meta?.total || 0,
        pendingOrders: pendingOrders.length,
        totalRevenue: allOrdersRes.data?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Загрузка статистики...</div>
  }

  return (
    <div className="admin-dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalProducts}</div>
            <div className="stat-label">Товаров</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Всего заказов</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pendingOrders}</div>
            <div className="stat-label">Ожидают обработки</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalRevenue.toLocaleString('ru-RU')} ₽</div>
            <div className="stat-label">Общая выручка</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
