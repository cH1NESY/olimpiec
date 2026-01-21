import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts, getCategories } from '../api/api'
import ProductCard from '../components/ProductCard/ProductCard'
import CategoryFilter from '../components/CategoryFilter/CategoryFilter'
import './Catalog.css'

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name')
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || ''
  })

  useEffect(() => {
    loadData()
  }, [searchParams])

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts({
          category: searchParams.get('category') || '',
          search: searchParams.get('search') || '',
          sort: searchParams.get('sort') || 'name'
        }),
        getCategories()
      ])
      setProducts(productsData.data || productsData || [])
      setCategories(categoriesData.data || categoriesData || [])
    } catch (error) {
      console.error('Error loading catalog:', error)
      // Mock data for development
      setProducts([
        { id: 1, name: 'Футбольный мяч', price: 2500, image: '/api/placeholder/300/300', category: 'футбол' },
        { id: 2, name: 'Баскетбольный мяч', price: 3200, image: '/api/placeholder/300/300', category: 'баскетбол' },
        { id: 3, name: 'Беговые кроссовки', price: 5500, image: '/api/placeholder/300/300', category: 'бег' },
        { id: 4, name: 'Гантели 5кг', price: 1800, image: '/api/placeholder/300/300', category: 'фитнес' },
      ])
      setCategories([
        { id: 1, name: 'Футбол', slug: 'футбол' },
        { id: 2, name: 'Баскетбол', slug: 'баскетбол' },
        { id: 3, name: 'Бег', slug: 'бег' },
        { id: 4, name: 'Фитнес', slug: 'фитнес' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSortChange = (e) => {
    const newSort = e.target.value
    setSortBy(newSort)
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      newParams.set('sort', newSort)
      return newParams
    })
  }

  return (
    <div className="catalog">
      <div className="container">
        <div className="catalog-header">
          <h1 className="catalog-title">Каталог товаров</h1>
          {filters.search && (
            <p className="catalog-search-info">
              Результаты поиска по запросу: <strong>{filters.search}</strong>
            </p>
          )}
        </div>

        <div className="catalog-content">
          <aside className="catalog-sidebar">
            <CategoryFilter 
              categories={categories}
              selectedCategory={filters.category}
              onCategoryChange={(category) => {
                setFilters(prev => ({ ...prev, category }))
                setSearchParams(prev => {
                  const newParams = new URLSearchParams(prev)
                  if (category) {
                    newParams.set('category', category)
                  } else {
                    newParams.delete('category')
                  }
                  return newParams
                })
              }}
            />
          </aside>

          <div className="catalog-main">
            <div className="catalog-toolbar">
              <div className="catalog-results">
                Найдено товаров: {products.length}
              </div>
              <div className="catalog-sort">
                <label htmlFor="sort-select">Сортировка:</label>
                <select 
                  id="sort-select"
                  className="sort-select"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="name">По названию</option>
                  <option value="price_asc">По цене: сначала дешевые</option>
                  <option value="price_desc">По цене: сначала дорогие</option>
                  <option value="newest">Сначала новые</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="loading">Загрузка...</div>
            ) : products.length > 0 ? (
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="catalog-empty">
                <p>Товары не найдены</p>
                <Link to="/catalog" className="btn btn-primary">
                  Сбросить фильтры
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Catalog
