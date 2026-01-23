import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts, getCategories, searchProducts } from '../api/api'
import ProductCard from '../components/ProductCard/ProductCard'
import CategoryFilter from '../components/CategoryFilter/CategoryFilter'
import FilterPanel from '../components/FilterPanel/FilterPanel'
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
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
  
  // Parse filters from URL params
  const parseFiltersFromParams = () => {
    return {
      category: searchParams.get('category') || '',
      search: searchParams.get('search') || '',
      brands: searchParams.get('brands') ? searchParams.get('brands').split(',') : [],
      genders: searchParams.get('genders') ? searchParams.get('genders').split(',') : [],
      sizes: searchParams.get('sizes') ? searchParams.get('sizes').split(',').map(Number) : [],
      price: {
        min: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')) : null,
        max: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')) : null
      },
      isNew: searchParams.get('is_new') === 'true'
    }
  }

  const [filters, setFilters] = useState(parseFiltersFromParams())

  // Update filters when URL params change
  useEffect(() => {
    setFilters(parseFiltersFromParams())
    setCurrentPage(parseInt(searchParams.get('page')) || 1)
    setSortBy(searchParams.get('sort') || 'newest')
  }, [searchParams])

  // Load data when filters, sort, or page changes
  useEffect(() => {
    loadData()
  }, [filters.category, filters.search, filters.brands, filters.genders, filters.sizes, filters.price, filters.isNew, sortBy, currentPage])

  const loadData = async () => {
    setLoading(true)
    try {
      const searchParam = filters.search
      
      let productsData
      if (searchParam) {
        // Используем поиск если есть поисковый запрос
        productsData = await searchProducts(searchParam)
        
        // Handle response structure
        let foundProducts = []
        if (productsData && productsData.success !== false) {
          if (Array.isArray(productsData.data)) {
            foundProducts = productsData.data
          } else if (Array.isArray(productsData)) {
            foundProducts = productsData
          }
        }
        
        // Apply filters to search results (client-side filtering for search)
        if (foundProducts.length > 0) {
          foundProducts = foundProducts.filter(product => {
            // Brand filter
            if (filters.brands.length > 0 && product.brand) {
              if (!filters.brands.includes(product.brand.slug)) return false
            }
            // Gender filter
            if (filters.genders.length > 0) {
              if (!filters.genders.includes(product.gender)) return false
            }
            // Size filter
            if (filters.sizes.length > 0 && product.sizes) {
              const productSizeIds = product.sizes.map(s => s.id || s.pivot?.size_id)
              if (!filters.sizes.some(sizeId => productSizeIds.includes(sizeId))) return false
            }
            // Price filter
            if (filters.price.min !== null && product.price < filters.price.min) return false
            if (filters.price.max !== null && product.price > filters.price.max) return false
            // New products filter
            if (filters.isNew && !product.is_new) return false
            return true
          })
        }
        
        setProducts(foundProducts)
        setPagination({
          current_page: 1,
          last_page: 1,
          per_page: foundProducts.length,
          total: foundProducts.length
        })
      } else {
        // Обычный список товаров с фильтрами и пагинацией
        const params = {
          sort: sortBy,
          per_page: 24,
          page: currentPage
        }
        
        if (filters.category) {
          params.category = filters.category
        }
        
        // Brand filters (multiple)
        if (filters.brands.length > 0) {
          params.brands = filters.brands.join(',')
        }
        
        // Gender filters (multiple)
        if (filters.genders.length > 0) {
          params.genders = filters.genders.join(',')
        }
        
        // Size filter (multiple)
        if (filters.sizes.length > 0) {
          params.sizes = filters.sizes.join(',')
        }
        
        // Price filters
        if (filters.price.min !== null) {
          params.min_price = filters.price.min
        }
        if (filters.price.max !== null) {
          params.max_price = filters.price.max
        }
        
        // New products filter
        if (filters.isNew) {
          params.is_new = 'true'
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

  const handleFilterChange = (newFilters) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      
      // Update all filter params
      if (newFilters.brands.length > 0) {
        newParams.set('brands', newFilters.brands.join(','))
      } else {
        newParams.delete('brands')
      }
      
      if (newFilters.genders.length > 0) {
        newParams.set('genders', newFilters.genders.join(','))
      } else {
        newParams.delete('genders')
      }
      
      if (newFilters.sizes.length > 0) {
        newParams.set('sizes', newFilters.sizes.join(','))
      } else {
        newParams.delete('sizes')
      }
      
      if (newFilters.price.min !== null && newFilters.price.min !== '') {
        newParams.set('min_price', newFilters.price.min)
      } else {
        newParams.delete('min_price')
      }
      
      if (newFilters.price.max !== null && newFilters.price.max !== '') {
        newParams.set('max_price', newFilters.price.max)
      } else {
        newParams.delete('max_price')
      }
      
      if (newFilters.isNew) {
        newParams.set('is_new', 'true')
      } else {
        newParams.delete('is_new')
      }
      
      newParams.delete('page') // Reset to first page on filter change
      return newParams
    })
  }

  const handleResetFilters = () => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      // Keep only category and search
      newParams.delete('brands')
      newParams.delete('genders')
      newParams.delete('sizes')
      newParams.delete('min_price')
      newParams.delete('max_price')
      newParams.delete('is_new')
      newParams.delete('page')
      return newParams
    })
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
                setSearchParams(prev => {
                  const newParams = new URLSearchParams(prev)
                  if (category) {
                    newParams.set('category', category)
                  } else {
                    newParams.delete('category')
                  }
                  newParams.delete('page')
                  return newParams
                })
              }}
            />
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
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
                  <option value="newest">Сначала новые</option>
                  <option value="popular">По популярности</option>
                  <option value="rating">По рейтингу</option>
                  <option value="price_asc">По цене: сначала дешевые</option>
                  <option value="price_desc">По цене: сначала дорогие</option>
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
