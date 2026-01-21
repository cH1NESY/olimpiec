import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getProduct } from '../api/api'
import { useCart } from '../context/CartContext'
import './Product.css'

const Product = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    setLoading(true)
    try {
      const data = await getProduct(id)
      setProduct(data.data || data)
      if (data.data?.images && data.data.images.length > 0) {
        setSelectedImage(0)
      }
    } catch (error) {
      console.error('Error loading product:', error)
      // Mock data for development
      setProduct({
        id: parseInt(id),
        name: 'Футбольный мяч',
        price: 2500,
        images: ['/api/placeholder/600/600', '/api/placeholder/600/600'],
        description: 'Профессиональный футбольный мяч для игры на любом покрытии. Изготовлен из высококачественных материалов.',
        characteristics: {
          'Материал': 'Синтетическая кожа',
          'Размер': '5',
          'Вес': '410-450 г',
          'Производитель': 'Nike'
        },
        category: 'футбол'
      })
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

  const images = product.images || [product.image || '/api/placeholder/600/600']

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
            <h1 className="product-title">{product.name}</h1>
            <div className="product-price-large">
              {product.price?.toLocaleString('ru-RU')} ₽
            </div>

            {product.description && (
              <div className="product-section">
                <h2 className="section-heading">Описание</h2>
                <p className="product-description">{product.description}</p>
              </div>
            )}

            {product.characteristics && Object.keys(product.characteristics).length > 0 && (
              <div className="product-section">
                <h2 className="section-heading">Характеристики</h2>
                <table className="characteristics-table">
                  <tbody>
                    {Object.entries(product.characteristics).map(([key, value]) => (
                      <tr key={key}>
                        <td className="char-name">{key}</td>
                        <td className="char-value">{value}</td>
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
