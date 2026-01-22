import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts, getCategories, searchProducts } from '../api/api'
import ProductCard from '../components/ProductCard/ProductCard'
import CategoryFilter from '../components/CategoryFilter/CategoryFilter'
import './Catalog.css'

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0
  })
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1)
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name')
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || ''
  })

  useEffect(() => {
    loadData()
  }, [searchParams.get('category'), searchParams.get('sort'), searchParams.get('page'), searchParams.get('search')])

  const loadData = async () => {
    setLoading(true)
    try {
      const categoryParam = searchParams.get('category') || ''
      const sortParam = searchParams.get('sort') || 'created_at'
      const page = parseInt(searchParams.get('page')) || 1
      
      const searchParam = searchParams.get('search')
      
      let productsData
      if (searchParam) {
        // Используем поиск если есть поисковый запрос
        productsData = await searchProducts(searchParam)
        console.log('Catalog search response:', productsData) // Debug log
        
        // Handle response structure
        let foundProducts = []
        if (productsData && productsData.success !== false) {
          if (Array.isArray(productsData.data)) {
            foundProducts = productsData.data
          } else if (Array.isArray(productsData)) {
            foundProducts = productsData
          }
        }
        
        console.log('Catalog search results:', foundProducts.length, foundProducts) // Debug log
        setProducts(foundProducts)
        setPagination({
          current_page: 1,
          last_page: 1,
          per_page: foundProducts.length,
          total: foundProducts.length
        })
      } else {
        // Обычный список товаров с пагинацией
        const params = {
          sort_by: sortParam === 'price' ? 'price' : (sortParam === 'price_asc' || sortParam === 'price_desc' ? 'price' : 'created_at'),
          sort_order: sortParam === 'price_asc' ? 'asc' : (sortParam === 'price_desc' ? 'desc' : 'desc'),
          per_page: 24,
          page: page
        }
        
        if (categoryParam) {
          params.category = categoryParam
        }
        
        productsData = await getProducts(params)
        setProducts(productsData.data || [])
        
        if (productsData.meta) {
          setPagination({
            current_page: productsData.meta.current_page || 1,
            last_page: productsData.meta.last_page || 1,
            per_page: productsData.meta.per_page || 24,
            total: productsData.meta.total || 0
          })
          setCurrentPage(productsData.meta.current_page || 1)
        }
      }
      
      const categoriesData = await getCategories()
      setCategories(categoriesData.data || [])
    } catch (error) {
      console.error('Error loading catalog:', error)
      setProducts([])
      setCategories([])
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
      newParams.delete('page') // Reset to first page on sort change
      return newParams
    })
  }

  const handlePageChange = (page) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      newParams.set('page', page.toString())
      return newParams
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="catalog">
      <div className="container">
        <div className="catalog-header">
          <h1 className="catalog-title">Каталог товаров</h1>
          {searchParams.get('search') && (
            <p className="catalog-search-info">
              Результаты поиска по запросу: <strong>{searchParams.get('search')}</strong>
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
                Найдено товаров: {pagination.total || products.length}
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
              <>
                <div className="products-grid">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {pagination.last_page > 1 && (
                  <div className="pagination">
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Назад
                    </button>
                    <div className="pagination-pages">
                      {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                        let pageNum
                        if (pagination.last_page <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= pagination.last_page - 2) {
                          pageNum = pagination.last_page - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        return (
                          <button
                            key={pageNum}
                            className={`pagination-page ${currentPage === pageNum ? 'active' : ''}`}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.last_page}
                    >
                      Вперед
                    </button>
                  </div>
                )}
              </>
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
