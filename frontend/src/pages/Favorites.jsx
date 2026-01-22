import { Link } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'
import ProductCard from '../components/ProductCard/ProductCard'
import './Favorites.css'

const Favorites = () => {
  const { favorites, removeFromFavorites } = useFavorites()

  if (favorites.length === 0) {
    return (
      <div className="favorites-page">
        <div className="container">
          <h1 className="favorites-title">Избранное</h1>
          <div className="favorites-empty">
            <div className="favorites-empty-icon">❤️</div>
            <p className="favorites-empty-text">В избранном пока ничего нет</p>
            <Link to="/catalog" className="btn btn-primary">
              Перейти в каталог
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="favorites-page">
      <div className="container">
        <h1 className="favorites-title">Избранное</h1>
        <p className="favorites-subtitle">
          Товаров в избранном: {favorites.length}
        </p>
        <div className="favorites-grid">
          {favorites.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Favorites
