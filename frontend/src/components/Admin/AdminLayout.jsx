import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AdminLayout.css'

const AdminLayout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <h2 className="admin-logo">Админ панель</h2>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
        
        <nav className="admin-nav">
          <Link 
            to="/admin" 
            className={`admin-nav-item ${isActive('/admin') && !isActive('/admin/products') && !isActive('/admin/categories') && !isActive('/admin/brands') && !isActive('/admin/orders') ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            {sidebarOpen && <span>Главная</span>}
          </Link>
          
          <div className="admin-nav-section">
            <div className="admin-nav-section-title">Товары</div>
            <Link 
              to="/admin/products" 
              className={`admin-nav-item ${isActive('/admin/products') ? 'active' : ''}`}
            >
              <span className="nav-icon">📦</span>
              {sidebarOpen && <span>Товары</span>}
            </Link>
            <Link 
              to="/admin/categories" 
              className={`admin-nav-item ${isActive('/admin/categories') ? 'active' : ''}`}
            >
              <span className="nav-icon">📁</span>
              {sidebarOpen && <span>Категории</span>}
            </Link>
            <Link 
              to="/admin/brands" 
              className={`admin-nav-item ${isActive('/admin/brands') ? 'active' : ''}`}
            >
              <span className="nav-icon">🏷️</span>
              {sidebarOpen && <span>Бренды</span>}
            </Link>
          </div>

          <div className="admin-nav-section">
            <div className="admin-nav-section-title">Заказы</div>
            <Link 
              to="/admin/orders" 
              className={`admin-nav-item ${isActive('/admin/orders') ? 'active' : ''}`}
            >
              <span className="nav-icon">🛒</span>
              {sidebarOpen && <span>Заказы</span>}
            </Link>
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <span className="nav-icon">👤</span>
            {sidebarOpen && (
              <div>
                <div className="admin-user-name">{user?.name}</div>
                <div className="admin-user-email">{user?.email}</div>
              </div>
            )}
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            {sidebarOpen && <span>Выйти</span>}
          </button>
          <Link to="/" className="admin-back-btn">
            <span className="nav-icon">🏠</span>
            {sidebarOpen && <span>На сайт</span>}
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1 className="admin-page-title">
            {location.pathname === '/admin' && 'Главная'}
            {location.pathname.startsWith('/admin/products') && 'Товары'}
            {location.pathname.startsWith('/admin/categories') && 'Категории'}
            {location.pathname.startsWith('/admin/brands') && 'Бренды'}
            {location.pathname.startsWith('/admin/orders') && 'Заказы'}
          </h1>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
