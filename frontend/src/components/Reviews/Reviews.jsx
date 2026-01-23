import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getProductReviews, createProductReview, checkCanReview } from '../../api/api'
import './Reviews.css'

const Reviews = ({ productId, productRating, reviewsCount, onReviewAdded }) => {
  const { user, isAuthenticated } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [canReview, setCanReview] = useState(false)
  const [checkingCanReview, setCheckingCanReview] = useState(false)
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    user_name: '',
    user_email: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [currentRating, setCurrentRating] = useState(parseFloat(productRating) || 0)
  const [currentReviewsCount, setCurrentReviewsCount] = useState(parseInt(reviewsCount) || 0)

  // Safely parse rating and reviews count
  const rating = currentRating || parseFloat(productRating) || 0
  const totalReviews = currentReviewsCount || parseInt(reviewsCount) || 0

  useEffect(() => {
    loadReviews()
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        user_name: user.name || '',
        user_email: user.email || ''
      }))
      checkCanReviewProduct()
    } else {
      setCanReview(false)
    }
  }, [productId, isAuthenticated, user])

  const checkCanReviewProduct = async () => {
    if (!isAuthenticated) {
      setCanReview(false)
      return
    }
    
    setCheckingCanReview(true)
    try {
      const response = await checkCanReview(productId)
      setCanReview(response.can_review || false)
    } catch (error) {
      console.error('Error checking can review:', error)
      setCanReview(false)
    } finally {
      setCheckingCanReview(false)
    }
  }

  // Update when props change
  useEffect(() => {
    setCurrentRating(parseFloat(productRating) || 0)
    setCurrentReviewsCount(parseInt(reviewsCount) || 0)
  }, [productRating, reviewsCount])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const response = await getProductReviews(productId)
      const loadedReviews = response.data || []
      setReviews(loadedReviews)
      
      // Update rating and count from loaded reviews
      if (loadedReviews.length > 0) {
        const avgRating = loadedReviews.reduce((sum, r) => sum + (parseInt(r.rating) || 0), 0) / loadedReviews.length
        setCurrentRating(avgRating)
        setCurrentReviewsCount(loadedReviews.length)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setMessage({ type: '', text: '' })
  }

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await createProductReview(productId, formData)
      if (response.success) {
        setMessage({ type: 'success', text: 'Отзыв успешно добавлен!' })
        setFormData({
          rating: 5,
          comment: '',
          user_name: user?.name || '',
          user_email: user?.email || ''
        })
        setShowForm(false)
        
        // Add new review to the list immediately if approved
        if (response.data) {
          const newReview = response.data
          // If review is approved, add it to the list
          if (newReview.is_approved) {
            setReviews(prev => [newReview, ...prev])
            // Update rating and count
            if (onReviewAdded) {
              onReviewAdded(newReview)
            }
          }
        }
        
        // Reload reviews to get updated data
        setTimeout(() => {
          loadReviews()
        }, 500)
      } else {
        setMessage({ type: 'error', text: response.message || 'Ошибка при добавлении отзыва' })
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      const errorMessage = error.response?.data?.message || 'Произошла ошибка при добавлении отзыва'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating, interactive = false, onClick = null) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onClick && onClick(star)}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={star <= rating ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    )
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      const reviewRating = parseInt(review.rating) || 0
      if (reviewRating >= 1 && reviewRating <= 5) {
        distribution[reviewRating] = (distribution[reviewRating] || 0) + 1
      }
    })
    return distribution
  }

  const ratingDistribution = getRatingDistribution()
  const reviewsListCount = reviews.length || 0

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h2 className="reviews-title">Отзывы и рейтинг</h2>
        {rating > 0 && (
          <div className="reviews-summary">
            <div className="rating-large">
              <span className="rating-value">{rating.toFixed(1)}</span>
              {renderStars(Math.round(rating))}
              <span className="reviews-count">({totalReviews} отзывов)</span>
            </div>
          </div>
        )}
      </div>

      {(totalReviews > 0 || reviewsListCount > 0) && (
        <div className="rating-distribution">
          {[5, 4, 3, 2, 1].map(ratingValue => {
            const count = ratingDistribution[ratingValue] || 0
            const reviewsTotal = totalReviews || reviewsListCount || 1
            const percentage = reviewsTotal > 0 ? (count / reviewsTotal) * 100 : 0
            return (
              <div key={ratingValue} className="rating-bar-item">
                <span className="rating-label">{ratingValue} звезд</span>
                <div className="rating-bar">
                  <div 
                    className="rating-bar-fill" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="rating-count">{count}</span>
              </div>
            )
          })}
        </div>
      )}

      {!showForm ? (
        <div className="review-actions">
          {checkingCanReview ? (
            <div className="loading">Проверка возможности оставить отзыв...</div>
          ) : isAuthenticated && canReview ? (
            <button 
              className="btn btn-primary btn-add-review"
              onClick={() => setShowForm(true)}
            >
              Написать отзыв
            </button>
          ) : isAuthenticated && !canReview ? (
            <div className="review-restriction">
              <p className="review-restriction-text">
                ⚠️ Вы можете оставить отзыв только на товары, которые вы заказали
              </p>
            </div>
          ) : (
            <div className="review-restriction">
              <p className="review-restriction-text">
                🔐 Войдите в аккаунт, чтобы оставить отзыв. Отзывы могут оставлять только покупатели.
              </p>
            </div>
          )}
        </div>
      ) : (
        <form className="review-form" onSubmit={handleSubmit}>
          <h3 className="review-form-title">Оставить отзыв</h3>
          
          {message.text && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {message.text}
            </div>
          )}

          <div className="form-group">
            <label>Ваша оценка *</label>
            <div className="rating-selector">
              {renderStars(formData.rating, true, handleRatingClick)}
              <span className="rating-text">
                {formData.rating === 5 && 'Отлично'}
                {formData.rating === 4 && 'Хорошо'}
                {formData.rating === 3 && 'Нормально'}
                {formData.rating === 2 && 'Плохо'}
                {formData.rating === 1 && 'Очень плохо'}
              </span>
            </div>
          </div>

          {!isAuthenticated && (
            <>
              <div className="form-group">
                <label htmlFor="user_name">Ваше имя *</label>
                <input
                  type="text"
                  id="user_name"
                  name="user_name"
                  required
                  value={formData.user_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="user_email">Email</label>
                <input
                  type="email"
                  id="user_email"
                  name="user_email"
                  value={formData.user_email}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="comment">Ваш отзыв</label>
            <textarea
              id="comment"
              name="comment"
              rows="5"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="Расскажите о вашем опыте использования товара..."
            />
          </div>

          <div className="review-form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Отправка...' : 'Отправить отзыв'}
            </button>
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={() => {
                setShowForm(false)
                setMessage({ type: '', text: '' })
              }}
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading">Загрузка отзывов...</div>
      ) : reviews.length > 0 ? (
        <div className="reviews-list">
          {reviews.map(review => {
            const reviewRating = parseInt(review.rating) || 0
            return (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="review-author">
                    <span className="review-author-name">{review.user_name}</span>
                    {review.is_verified_purchase && (
                      <span className="verified-badge">✓ Подтвержденная покупка</span>
                    )}
                  </div>
                  <div className="review-rating">
                    {renderStars(reviewRating)}
                    <span className="review-date">
                      {new Date(review.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>
                {review.comment && (
                  <div className="review-comment">{review.comment}</div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="reviews-empty">
          <p>Пока нет отзывов. Будьте первым!</p>
        </div>
      )}
    </div>
  )
}

export default Reviews
