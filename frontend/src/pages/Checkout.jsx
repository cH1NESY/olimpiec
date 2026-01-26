import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrder } from '../api/api'
import './Checkout.css'

const Checkout = () => {
  const { cart, getTotalPrice, deliveryMethod, setDeliveryMethod, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    comment: ''
  })

  // Auto-fill form with user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      }))
    }
  }, [isAuthenticated, user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepare order items
      const orderItems = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        size_id: item.selectedSize ? item.selectedSize.id : null,
      }))

      // Create order
      const orderData = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        delivery_method: deliveryMethod,
        items: orderItems,
        comment: formData.comment || null,
      }

      if (deliveryMethod === 'delivery') {
        orderData.delivery_address = formData.address
      } else {
        orderData.store_id = 1 // Default store for pickup
      }

      const response = await createOrder(orderData)

      if (response.success && response.data.id) {
        // Redirect to payment page
        navigate(`/payment?order_id=${response.data.id}`)
      } else {
        throw new Error(response.message || 'Ошибка при создании заказа')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert(error.response?.data?.message || error.message || 'Ошибка при создании заказа')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="checkout-empty">
            <h1>Корзина пуста</h1>
            <p>Добавьте товары в корзину для оформления заказа</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Оформление заказа</h1>
        <div className="checkout-content">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2 className="form-section-title">Способ получения</h2>
              <div className="delivery-methods">
                <label className={`delivery-option ${deliveryMethod === 'pickup' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="delivery"
                    value="pickup"
                    checked={deliveryMethod === 'pickup'}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                  />
                  <div className="delivery-option-content">
                    <span className="delivery-option-title">Самовывоз</span>
                    <span className="delivery-option-desc">Заберите заказ в ближайшем магазине</span>
                  </div>
                </label>
                <label className={`delivery-option ${deliveryMethod === 'delivery' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="delivery"
                    value="delivery"
                    checked={deliveryMethod === 'delivery'}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                  />
                  <div className="delivery-option-content">
                    <span className="delivery-option-title">Доставка</span>
                    <span className="delivery-option-desc">Доставка по указанному адресу</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-section">
              <h2 className="form-section-title">Контактные данные</h2>
              <div className="form-group">
                <label htmlFor="name">Имя *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Телефон *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              {deliveryMethod === 'delivery' && (
                <div className="form-group">
                  <label htmlFor="address">Адрес доставки *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required={deliveryMethod === 'delivery'}
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="comment">Комментарий к заказу</label>
                <textarea
                  id="comment"
                  name="comment"
                  rows="4"
                  value={formData.comment}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
              {loading ? 'Оформление...' : `Оформить заказ на ${getTotalPrice().toLocaleString('ru-RU')} ₽`}
            </button>
          </form>

          <div className="checkout-summary">
            <h2 className="summary-title">Ваш заказ</h2>
            <div className="summary-items">
              {cart.map(item => (
                <div key={item.uniqueId} className="summary-item">
                  <div className="summary-item-info">
                    <span className="summary-item-name">{item.name}</span>
                    {item.selectedSize && (
                      <span className="summary-item-size">Размер: {item.selectedSize.name}</span>
                    )}
                    <span className="summary-item-qty">x {item.quantity}</span>
                  </div>
                  <span className="summary-item-price">
                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              ))}
            </div>
            <div className="summary-total">
              <span>Итого:</span>
              <span className="total-price">{getTotalPrice().toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
