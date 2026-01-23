import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { checkPaymentStatus } from '../api/api'
import './PaymentSuccess.css'

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderId = searchParams.get('order_id')
  
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!orderId) {
      setError('ID заказа не указан')
      setLoading(false)
      return
    }

    checkStatus()
  }, [orderId])

  const checkStatus = async () => {
    try {
      setLoading(true)
      const response = await checkPaymentStatus(orderId)
      
      if (response.success) {
        setPaymentStatus(response.data)
        
        // If payment is successful, show success message immediately
        if (response.data.is_paid) {
          // Don't redirect, show success message on this page
          setLoading(false)
        }
      } else {
        setError('Не удалось проверить статус оплаты')
      }
    } catch (err) {
      console.error('Status check error:', err)
      setError('Ошибка при проверке статуса оплаты')
    } finally {
      setLoading(false)
    }
  }

  // Poll payment status every 3 seconds if not paid yet
  useEffect(() => {
    if (!orderId || paymentStatus?.is_paid) {
      return
    }

    const interval = setInterval(() => {
      checkStatus()
    }, 3000)

    return () => clearInterval(interval)
  }, [orderId, paymentStatus?.is_paid])

  if (loading) {
    return (
      <div className="payment-success-page">
        <div className="container">
          <div className="payment-checking">
            <div className="spinner"></div>
            <h2>Проверка статуса оплаты...</h2>
            <p>Пожалуйста, подождите</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="payment-success-page">
        <div className="container">
          <div className="payment-error">
            <h2>Ошибка</h2>
            <p>{error}</p>
            <Link to="/cart" className="btn btn-primary">
              Вернуться в корзину
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isPaid = paymentStatus?.is_paid

  if (isPaid) {
    return (
      <div className="payment-success-page">
        <div className="container">
          <div className="payment-result success">
            <div className="success-icon">✓</div>
            <h2>Спасибо за заказ!</h2>
            <h3>Оплата прошла успешно</h3>
            <p>Ваш заказ #{orderId} успешно оплачен и принят в обработку.</p>
            <p className="order-info">Мы свяжемся с вами в ближайшее время для подтверждения заказа.</p>
            <div className="payment-actions">
              <Link to="/profile" className="btn btn-primary">
                Перейти в личный кабинет
              </Link>
              <Link to="/catalog" className="btn btn-secondary">
                Продолжить покупки
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="payment-success-page">
      <div className="container">
        <div className="payment-result pending">
          <div className="pending-icon">⏳</div>
          <h2>Проверка оплаты...</h2>
          <p>Мы проверяем статус вашего платежа. Это может занять несколько секунд.</p>
          <p className="checking-message">Пожалуйста, подождите...</p>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess
