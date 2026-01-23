import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createPayment, checkPaymentStatus } from '../api/api'
import './Payment.css'

const Payment = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderId = searchParams.get('order_id')
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [paymentUrl, setPaymentUrl] = useState(null)

  useEffect(() => {
    if (!orderId) {
      setError('ID заказа не указан')
      setLoading(false)
      return
    }

    createPaymentSession()
  }, [orderId])

  const createPaymentSession = async () => {
    try {
      setLoading(true)
      const response = await createPayment(orderId)
      
      if (response.success && response.data?.confirmation_url) {
        setPaymentUrl(response.data.confirmation_url)
        // Redirect to YooKassa payment page
        window.location.href = response.data.confirmation_url
      } else {
        const errorMessage = response?.message || response?.data?.message || 'Ошибка при создании платежа'
        setError(errorMessage)
        console.error('Payment creation failed:', response)
      }
    } catch (err) {
      console.error('Payment creation error:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при создании платежа. Попробуйте позже.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="payment-loading">
            <div className="spinner"></div>
            <h2>Перенаправление на страницу оплаты...</h2>
            <p>Пожалуйста, подождите</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="payment-error">
            <h2>Ошибка оплаты</h2>
            <p>{error}</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/cart')}
            >
              Вернуться в корзину
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default Payment
