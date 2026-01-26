import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useFavorites } from '../../context/FavoritesContext'
import './ProductCard.css'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  const [showHeart, setShowHeart] = useState(false)
  const favorite = isFavorite(product.id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  const handleToggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(product)
  }

  // Get first image from API response
  const getProductImage = () => {
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0]
      if (typeof firstImage === 'string') {
        return firstImage.startsWith('http') || firstImage.startsWith('/') 
          ? firstImage 
          : `/storage/${firstImage}`
      }
      const url = firstImage.image_url || firstImage.image_path || firstImage.url || firstImage.path
      if (!url) return '/api/placeholder/300/300'
      return url.startsWith('http') || url.startsWith('/') ? url : `/storage/${url}`
    }
    return product.image || '/api/placeholder/300/300'
  }

  return (
    <Link 
      to={`/product/${product.id}`} 
      className="product-card"
      onMouseEnter={() => setShowHeart(true)}
      onMouseLeave={() => setShowHeart(false)}
    >
      <div className="product-image-wrapper">
        <img 
          src={getProductImage()} 
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23ddd" width="300" height="300"/%3E%3C/svg%3E'
          }}
        />
        <button
          className={`favorite-btn ${showHeart || favorite ? 'show' : ''} ${favorite ? 'active' : ''}`}
          onClick={handleToggleFavorite}
          aria-label={favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {(() => {
          const rating = parseFloat(product.rating) || 0
          const reviewsCount = parseInt(product.reviews_count) || 0
          return rating > 0 && (
            <div className="product-rating">
              <div className="product-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="product-star"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill={star <= Math.round(rating) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="product-rating-value">{rating.toFixed(1)}</span>
              {reviewsCount > 0 && (
                <span className="product-reviews-count">({reviewsCount})</span>
              )}
            </div>
          )
        })()}
        <div className="product-footer">
          <span className="product-price">{product.price?.toLocaleString('ru-RU')} ₽</span>
          <button 
            className="product-add-btn"
            onClick={handleAddToCart}
            aria-label="Добавить в корзину"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </button>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
