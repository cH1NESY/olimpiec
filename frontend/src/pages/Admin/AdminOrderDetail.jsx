import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminGetOrder, adminUpdateOrderStatus } from '../../api/api'
import './AdminOrderDetail.css'

const AdminOrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [id])

  const loadOrder = async () => {
    setLoading(true)
    try {
      const response = await adminGetOrder(id)
      setOrder(response.data)
    } catch (error) {
      console.error('Error loading order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Изменить статус заказа на "${newStatus}"?`)) {
      return
    }

    setUpdating(true)
    try {
      await adminUpdateOrderStatus(id, newStatus)
      loadOrder()
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Ошибка при обновлении статуса')
    } finally {
      setUpdating(false)
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

  if (loading) {
    return <div className="loading">Загрузка заказа...</div>
  }

  if (!order) {
    return <div className="loading">Заказ не найден</div>
  }

  return (
    <div className="admin-order-detail">
      <div className="order-header">
        <div>
          <button className="btn btn-outline" onClick={() => navigate('/admin/orders')}>
            ← Назад к заказам
          </button>
          <h2>Заказ #{order.order_number}</h2>
          <div className="order-meta">
            <span>Дата: {new Date(order.created_at).toLocaleString('ru-RU')}</span>
            <span>Статус: {getStatusBadge(order.status)}</span>
          </div>
        </div>
        <div className="order-status-control">
          <label>Изменить статус:</label>
          <div className="status-control-wrapper">
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="status-select"
              style={{
                backgroundColor: `${getStatusInfo(order.status).color}20`,
                color: getStatusInfo(order.status).color,
                border: `2px solid ${getStatusInfo(order.status).color}`
              }}
            >
              <option value="pending">Ожидает</option>
              <option value="paid">Оплачен</option>
              <option value="processing">В обработке</option>
              <option value="shipped">Отправлен</option>
              <option value="delivered">Доставлен</option>
              <option value="cancelled">Отменен</option>
            </select>
            {updating && (
              <span className="status-updating">Обновление...</span>
            )}
          </div>
        </div>
      </div>

      <div className="order-content">
        <div className="order-section">
          <h3>Информация о клиенте</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Имя:</label>
              <span>{order.customer_name}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{order.customer_email}</span>
            </div>
            <div className="info-item">
              <label>Телефон:</label>
              <span>{order.customer_phone}</span>
            </div>
            {order.user && (
              <div className="info-item">
                <label>Пользователь:</label>
                <span>{order.user.name} (ID: {order.user.id})</span>
              </div>
            )}
          </div>
        </div>

        <div className="order-section">
          <h3>Доставка</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Способ получения:</label>
              <span>{order.delivery_method === 'pickup' ? 'Самовывоз' : 'Доставка'}</span>
            </div>
            {order.delivery_address && (
              <div className="info-item">
                <label>Адрес доставки:</label>
                <span>{order.delivery_address}</span>
              </div>
            )}
            {order.store && (
              <div className="info-item">
                <label>Магазин:</label>
                <span>{order.store.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="order-section">
          <h3>Товары</h3>
          <div className="order-items-table">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Размер</th>
                  <th>Количество</th>
                  <th>Цена</th>
                  <th>Итого</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="order-item-product">
                        {item.product?.images?.[0] && (
                          <img 
                            src={(() => {
                              const firstImage = item.product.images[0]
                              const imageUrl = typeof firstImage === 'string' 
                                ? (firstImage.startsWith('http') || firstImage.startsWith('/') ? firstImage : `/storage/${firstImage}`)
                                : (firstImage?.image_url || firstImage?.image_path || '')
                              return imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/') 
                                ? `/storage/${imageUrl}` 
                                : imageUrl
                            })()} 
                            alt={item.product.name}
                            className="order-item-image"
                          />
                        )}
                        <span>{item.product?.name || 'Товар удален'}</span>
                      </div>
                    </td>
                    <td>{item.size?.name || '-'}</td>
                    <td>{item.quantity}</td>
                    <td>{parseFloat(item.price || 0).toLocaleString('ru-RU')} ₽</td>
                    <td>{parseFloat(item.total || 0).toLocaleString('ru-RU')} ₽</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {order.comment && (
          <div className="order-section">
            <h3>Комментарий к заказу</h3>
            <p className="order-comment">{order.comment}</p>
          </div>
        )}

        <div className="order-section order-total">
          <div className="order-total-row">
            <span className="total-label">Итого:</span>
            <span className="total-value">
              {parseFloat(order.total_amount || 0).toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOrderDetail
