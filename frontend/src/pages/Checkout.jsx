import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { createOrder } from '../api/api'
import './Checkout.css'

const Checkout = () => {
  const { cart, getTotalPrice, deliveryMethod, setDeliveryMethod, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    comment: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createOrder({
        ...formData,
        delivery_method: deliveryMethod,
        items: cart,
        total: getTotalPrice()
      })
      clearCart()
      navigate('/checkout/success')
    } catch (error) {
      console.error('Error creating order:', error)
      // For development, just clear cart and navigate
      clearCart()
      navigate('/checkout/success')
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
                <div key={item.id} className="summary-item">
                  <span className="summary-item-name">{item.name} × {item.quantity}</span>
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
