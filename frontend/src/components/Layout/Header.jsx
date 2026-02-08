import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useFavorites } from '../../context/FavoritesContext'
import SearchBar from '../SearchBar/SearchBar'
import './Header.css'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { getTotalItems } = useCart()
  const { user, logout, isAuthenticated } = useAuth()
  const { getFavoritesCount } = useFavorites()
  const navigate = useNavigate()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  // Функция для прокрутки вверх при переходе
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Обработчик клика на ссылку навигации
  const handleNavClick = () => {
    setIsMenuOpen(false)
    // Небольшая задержка для того, чтобы React Router успел перейти на новую страницу
    setTimeout(() => {
      scrollToTop()
    }, 100)
  }

  return (
    <header className={`header ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo" onClick={scrollToTop}>
            <img src="/olimp-logo.jpg" alt="Олимпиец" className="logo-image" />
            <div className="logo-text-wrapper">
              <span className="logo-text">ОЛИМПИЕЦ</span>
              <span className="logo-subtitle">Спортивный магазин</span>
            </div>
          </Link>

          <nav 
            className={`nav ${isMenuOpen ? 'nav-open' : ''}`} 
            onClick={(e) => {
              // Close menu when clicking on overlay (not on menu content)
              if (e.target === e.currentTarget) {
                setIsMenuOpen(false)
              }
            }}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <Link to="/" className="nav-link" onClick={handleNavClick}>
                Главная
              </Link>
              <Link to="/catalog" className="nav-link" onClick={handleNavClick}>
                Каталог
              </Link>
              <Link to="/stores" className="nav-link" onClick={handleNavClick}>
                Магазины
              </Link>
            </div>
          </nav>

          <div className="header-actions">
            <SearchBar />
            <Link to="/favorites" className="header-icon header-icon-box favorites-icon" title="Избранное">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {getFavoritesCount() > 0 && (
                <span className="header-badge">{getFavoritesCount()}</span>
              )}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="header-icon header-icon-box profile-icon" title="Личный кабинет">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </Link>
                <button onClick={handleLogout} className="header-icon header-icon-box" title="Выйти" style={{ background: 'linear-gradient(135deg, var(--bg-blue-light) 0%, var(--white) 100%)', borderColor: 'var(--primary-blue-light)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '14px' }}>
                Войти
              </Link>
            )}
            <Link to="/cart" className="header-icon header-icon-box cart-icon-box" title="Корзина">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {getTotalItems() > 0 && (
                <span className="header-badge cart-badge">{getTotalItems()}</span>
              )}
            </Link>
            <button className="menu-toggle" onClick={toggleMenu} aria-label="Меню">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
