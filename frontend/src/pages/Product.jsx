import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getProduct } from '../api/api'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import Reviews from '../components/Reviews/Reviews'
import './Product.css'

const Product = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState(null)
  const { addToCart } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  const favorite = product ? isFavorite(product.id) : false

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    setLoading(true)
    try {
      const response = await getProduct(id)
      const productData = response.data || response
      setProduct(productData)
      if (productData?.images && productData.images.length > 0) {
        setSelectedImage(0)
      }
      // If product has sizes but none selected, don't auto-select to force user choice?
      // Or auto-select first available? Let's force choice for clarity.
      setSelectedSize(null);
    } catch (error) {
      console.error('Error loading product:', error)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0) {
      if (!selectedSize) {
        alert('Пожалуйста, выберите размер');
        return;
      }
      // Check stock for selected size
      const stock = selectedSize.pivot?.stock_quantity || 0;
      if (stock < quantity) {
        alert(`Недостаточно товара на складе. Доступно: ${stock} шт.`);
        return;
      }
    } else {
      // Check total stock for product without sizes
      // Assuming product.stock_quantity holds total/global stock if no sizes
      const stock = product.stock_quantity || 0;
       // If stock management is strictly enforced:
      if (stock < quantity && stock !== null) { // stock !== null check if unlimited? Assuming 0 default.
         // If stock is 0, logic should prevent adding.
         // But existing logic didn't check.
         // Let's assume strict check if stock_quantity is used.
         if (stock <= 0) {
            alert('Товар временно отсутствует на складе');
            return;
         }
      }
    }
    
    addToCart(product, quantity, selectedSize)
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  if (!product) {
    return <div className="loading">Товар не найден</div>
  }

          // Handle images from API - can be array of objects or array of strings
          const getImageUrl = (img) => {
            if (typeof img === 'string') {
              // If it's already a full URL or starts with /, return as is
              return img.startsWith('http') || img.startsWith('/') ? img : `/storage/${img}`
            }
            // Use image_url if available (from accessor), otherwise image_path
            const url = img?.image_url || img?.image_path || img?.url || img?.path
            if (!url) return '/api/placeholder/600/600'
            // If it's already a full URL or starts with /, return as is
            if (url.startsWith('http') || url.startsWith('/')) return url
            // Otherwise, assume it's a storage path and add /storage/ prefix
            return `/storage/${url}`
          }
          
          const images = product.images && product.images.length > 0
            ? product.images.map(getImageUrl)
            : [product.image || '/api/placeholder/600/600']

  return (
    <div className="product-page">
      <div className="container">
        <div className="product-content">
          <div className="product-gallery">
            <div className="product-main-image">
              <img 
                src={images[selectedImage] || images[0]} 
                alt={product.name}
                      onError={(e) => {
                        e.target.onerror = null // Prevent infinite loop
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600"%3E%3Crect fill="%23ddd" width="600" height="600"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'
                      }}
              />
            </div>
            {images.length > 1 && (
              <div className="product-thumbnails">
                {images.map((img, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} ${index + 1}`}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3C/svg%3E'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-details">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h1 className="product-title" style={{ flex: 1, marginRight: '16px' }}>{product.name}</h1>
              <button
                className={`favorite-btn-product ${favorite ? 'active' : ''}`}
                onClick={() => toggleFavorite(product)}
                aria-label={favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                title={favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>
            <div className="product-price-large">
              {product.price?.toLocaleString('ru-RU')} ₽
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div className="product-section">
                <h2 className="section-heading">Размеры</h2>
                <div className="size-selector">
                  {product.sizes.map(size => {
                    const stock = size.pivot?.stock_quantity || 0;
                    const isOutOfStock = stock <= 0;
                    return (
                      <button
                        key={size.id}
                        className={`size-btn ${selectedSize?.id === size.id ? 'active' : ''} ${isOutOfStock ? 'disabled' : ''}`}
                        onClick={() => !isOutOfStock && setSelectedSize(size)}
                        disabled={isOutOfStock}
                        title={isOutOfStock ? 'Нет в наличии' : `Осталось: ${stock}`}
                      >
                        {size.name}
                      </button>
                    )
                  })}
                </div>
                {selectedSize ? (
                  <div className="stock-info">
                    {selectedSize.pivot?.stock_quantity < 5 
                      ? <span className="text-warning">Осталось мало: {selectedSize.pivot.stock_quantity} шт.</span>
                      : <span className="text-success">В наличии: {selectedSize.pivot.stock_quantity} шт.</span>
                    }
                  </div>
                ) : (
                  <div className="stock-info hint">Выберите размер, чтобы узнать наличие</div>
                )}
              </div>
            )}

            {product.description && (
              <div className="product-section">
                <h2 className="section-heading">Описание</h2>
                <p className="product-description">{product.description}</p>
              </div>
            )}

            {product.characteristics && product.characteristics.length > 0 && (
              <div className="product-section">
                <h2 className="section-heading">Характеристики</h2>
                <table className="characteristics-table">
                  <tbody>
                    {product.characteristics.map((char, index) => (
                      <tr key={index}>
                        <td className="char-name">{char.name || char.key}</td>
                        <td className="char-value">{char.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="product-actions">
              <div className="quantity-selector">
                <label htmlFor="quantity">Количество:</label>
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    −
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="quantity-input"
                  />
                  <button 
                    className="quantity-btn"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <button 
                className="btn btn-primary btn-add-cart" 
                onClick={handleAddToCart}
                disabled={product.sizes && product.sizes.length > 0 && !selectedSize}
              >
                {product.sizes && product.sizes.length > 0 && !selectedSize ? 'Выберите размер' : 'Добавить в корзину'}
              </button>
            </div>
          </div>
        </div>

        <Reviews 
          productId={product.id}
          productRating={product.rating || 0}
          reviewsCount={product.reviews_count || 0}
          onReviewAdded={(newReview) => {
            // Reload product data to get updated rating
            loadProduct()
          }}
        />
      </div>
    </div>
  )
}

export default Product
