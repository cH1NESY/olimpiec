import { Link } from 'react-router-dom'
import './CheckoutSuccess.css'

const CheckoutSuccess = () => {
  return (
    <div className="checkout-success-page">
      <div className="container">
        <div className="success-content">
          <div className="success-icon">✓</div>
          <h1 className="success-title">Заказ успешно оформлен!</h1>
          <p className="success-message">
            Спасибо за ваш заказ. Мы свяжемся с вами в ближайшее время для подтверждения.
          </p>
          <div className="success-actions">
            <Link to="/catalog" className="btn btn-primary">
              Продолжить покупки
            </Link>
            <Link to="/profile" className="btn btn-secondary">
              Перейти в личный кабинет
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutSuccess
