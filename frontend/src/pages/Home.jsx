import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">ОЛИМПИЕЦ</h1>
            <p className="hero-subtitle">Спортивный магазин для настоящих чемпионов</p>
            <p className="hero-description">
              Всё необходимое для спорта и активного образа жизни. 
              Качественная экипировка, обувь и аксессуары от ведущих производителей.
            </p>
            <Link to="/catalog" className="btn btn-primary hero-cta">
              Перейти в каталог
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3 className="feature-title">Быстрая доставка</h3>
              <p className="feature-text">Доставка по всей стране в кратчайшие сроки</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏪</div>
              <h3 className="feature-title">Самовывоз</h3>
              <p className="feature-text">Заберите заказ в ближайшем магазине</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3 className="feature-title">Удобная оплата</h3>
              <p className="feature-text">Различные способы оплаты на ваш выбор</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
