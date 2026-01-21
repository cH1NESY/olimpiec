import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">ОЛИМПИЕЦ</h3>
            <p className="footer-text">Спортивный магазин для настоящих чемпионов</p>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Навигация</h4>
            <Link to="/" className="footer-link">Главная</Link>
            <Link to="/catalog" className="footer-link">Каталог</Link>
            <Link to="/stores" className="footer-link">Магазины</Link>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Информация</h4>
            <Link to="/profile" className="footer-link">Личный кабинет</Link>
            <Link to="/cart" className="footer-link">Корзина</Link>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Контакты</h4>
            <p className="footer-text">Телефон: +7 (800) 123-45-67</p>
            <p className="footer-text">Email: info@olimpiec.ru</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Олимпиец. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
