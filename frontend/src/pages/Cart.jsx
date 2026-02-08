import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Cart.css'

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart()

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-empty">
            <h1 className="cart-title">Корзина пуста</h1>
            <p className="cart-empty-text">Добавьте товары в корзину, чтобы продолжить покупки</p>
            <Link to="/catalog" className="btn btn-primary">
              Перейти в каталог
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-title">Корзина</h1>
        <div className="cart-content">
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.uniqueId} className="cart-item">
                <Link to={`/product/${item.id}`} className="cart-item-image">
                  <img 
                    src={item.image || (item.images && item.images[0]) || '/api/placeholder/150/150'} 
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = '/placeholder.svg'
                    }}
                  />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/product/${item.id}`} className="cart-item-name">
                    {item.name}
                  </Link>
                  {item.selectedSize && (
                    <div className="cart-item-size">
                      Размер: {item.selectedSize.name}
                    </div>
                  )}
                  <div className="cart-item-price">
                    {item.price?.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
                <div className="cart-item-quantity">
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.uniqueId, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.uniqueId, item.quantity + 1)}
                    disabled={item.maxStock !== undefined && item.quantity >= item.maxStock}
                    style={{ opacity: item.maxStock !== undefined && item.quantity >= item.maxStock ? 0.5 : 1 }}
                  >
                    +
                  </button>
                </div>
                <div className="cart-item-total">
                  {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                </div>
                <button 
                  className="cart-item-remove"
                  onClick={() => removeFromCart(item.uniqueId)}
                  aria-label="Удалить товар"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h2 className="summary-title">Итого</h2>
            <div className="summary-row">
              <span>Товары ({getTotalItems()})</span>
              <span>{getTotalPrice().toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="summary-total">
              <span>К оплате</span>
              <span>{getTotalPrice().toLocaleString('ru-RU')} ₽</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-block">
              Перейти к оформлению
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
