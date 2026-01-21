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
              <div key={item.id} className="cart-item">
                <Link to={`/product/${item.id}`} className="cart-item-image">
                  <img 
                    src={item.image || '/api/placeholder/150/150'} 
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150x150?text=No+Image'
                    }}
                  />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/product/${item.id}`} className="cart-item-name">
                    {item.name}
                  </Link>
                  <div className="cart-item-price">
                    {item.price?.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
                <div className="cart-item-quantity">
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <div className="cart-item-total">
                  {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                </div>
                <button 
                  className="cart-item-remove"
                  onClick={() => removeFromCart(item.id)}
                  aria-label="Удалить товар"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <div className="summary-content">
              <div className="summary-row">
                <span>Товаров в корзине:</span>
                <span>{getTotalItems()}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Итого:</span>
                <span className="total-price">{getTotalPrice().toLocaleString('ru-RU')} ₽</span>
              </div>
              <Link to="/checkout" className="btn btn-primary btn-checkout">
                Оформить заказ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
