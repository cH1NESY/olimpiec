import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getProduct } from '../api/api'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import './Product.css'

const Product = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
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
    } catch (error) {
      console.error('Error loading product:', error)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  if (!product) {
    return <div className="loading">Товар не найден</div>
  }

  // Handle images from API - can be array of objects or array of strings
  const getImageUrl = (img) => {
    if (typeof img === 'string') return img
    return img?.image_path || img?.url || img?.path || '/api/placeholder/600/600'
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
                  e.target.src = 'https://via.placeholder.com/600x600?text=No+Image'
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
                        e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'
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
              <button className="btn btn-primary btn-add-cart" onClick={handleAddToCart}>
                Добавить в корзину
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Product
