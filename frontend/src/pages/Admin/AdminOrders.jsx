import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminGetOrders, adminUpdateOrderStatus } from '../../api/api'
import './AdminOrders.css'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState({})
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    date_from: '',
    date_to: ''
  })
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  })

  useEffect(() => {
    loadOrders()
  }, [filters, pagination.current_page])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.current_page,
        per_page: 20,
        ...filters
      }
      const response = await adminGetOrders(params)
      setOrders(response.data || [])
      setPagination({
        current_page: response.meta?.current_page || 1,
        last_page: response.meta?.last_page || 1,
        total: response.meta?.total || 0
      })
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPagination(prev => ({ ...prev, current_page: 1 }))
  }

  const handleStatusChange = async (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return

    const statusLabels = {
      pending: 'Ожидает',
      paid: 'Оплачен',
      processing: 'В обработке',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменен'
    }

    if (!window.confirm(`Изменить статус заказа #${order.order_number} на "${statusLabels[newStatus]}"?`)) {
      return
    }

    setUpdatingStatus(prev => ({ ...prev, [orderId]: true }))
    try {
      await adminUpdateOrderStatus(orderId, newStatus)
      // Update local state
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ))
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Ошибка при обновлении статуса заказа')
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }))
    }
  }

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { label: 'Ожидает', color: '#f59e0b' },
      paid: { label: 'Оплачен', color: '#3b82f6' },
      processing: { label: 'В обработке', color: '#8b5cf6' },
      shipped: { label: 'Отправлен', color: '#10b981' },
      delivered: { label: 'Доставлен', color: '#16a34a' },
      cancelled: { label: 'Отменен', color: '#ef4444' }
    }
    return statusMap[status] || { label: status, color: '#6b7280' }
  }

  const getStatusBadge = (status) => {
    const statusInfo = getStatusInfo(status)
    return (
      <span 
        className="status-badge"
        style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color }}
      >
        {statusInfo.label}
      </span>
    )
  }

  return (
    <div className="admin-orders">
      <div className="admin-toolbar">
        <h2>Заказы</h2>
        <div className="admin-filters">
          <input
            type="text"
            placeholder="Поиск по номеру, имени, email..."
            className="admin-filter-input"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <select
            className="admin-filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Все статусы</option>
            <option value="pending">Ожидает</option>
            <option value="paid">Оплачен</option>
            <option value="processing">В обработке</option>
            <option value="shipped">Отправлен</option>
            <option value="delivered">Доставлен</option>
            <option value="cancelled">Отменен</option>
          </select>
          <input
            type="date"
            className="admin-filter-input"
            value={filters.date_from}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
            placeholder="От"
          />
          <input
            type="date"
            className="admin-filter-input"
            value={filters.date_to}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
            placeholder="До"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Загрузка заказов...</div>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Номер заказа</th>
                  <th>Клиент</th>
                  <th>Email</th>
                  <th>Телефон</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.order_number}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.customer_email}</td>
                    <td>{order.customer_phone}</td>
                    <td>{parseFloat(order.total_amount || 0).toLocaleString('ru-RU')} ₽</td>
                    <td>
                      <div className="status-control">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingStatus[order.id]}
                          className="status-select-inline"
                          style={{
                            backgroundColor: `${getStatusInfo(order.status).color}20`,
                            color: getStatusInfo(order.status).color,
                            border: `1px solid ${getStatusInfo(order.status).color}`
                          }}
                        >
                          <option value="pending">Ожидает</option>
                          <option value="paid">Оплачен</option>
                          <option value="processing">В обработке</option>
                          <option value="shipped">Отправлен</option>
                          <option value="delivered">Доставлен</option>
                          <option value="cancelled">Отменен</option>
                        </select>
                        {updatingStatus[order.id] && (
                          <span className="status-updating">...</span>
                        )}
                      </div>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                    <td>
                      <div className="admin-actions">
                        <Link 
                          to={`/admin/orders/${order.id}`}
                          className="btn-action btn-edit"
                          title="Просмотр деталей"
                        >
                          👁️
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {pagination.last_page > 1 && (
            <div className="admin-pagination">
              <button
                disabled={pagination.current_page === 1}
                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
              >
                Назад
              </button>
              <span>
                Страница {pagination.current_page} из {pagination.last_page}
              </span>
              <button
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
              >
                Вперед
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminOrders
