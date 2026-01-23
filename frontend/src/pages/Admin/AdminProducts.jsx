import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { adminGetProducts, adminDeleteProduct, adminGetCategories, adminGetBrands } from '../../api/api'
import './AdminProducts.css'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    brand_id: '',
    is_active: ''
  })
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  })
  const searchTimeoutRef = useRef(null)

  useEffect(() => {
    loadCategories()
    loadBrands()
  }, [])

  useEffect(() => {
    loadData()
  }, [filters.category_id, filters.brand_id, filters.is_active, pagination.current_page])

  // Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      loadData()
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [filters.search])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.current_page,
        per_page: 20
      }
      
      // Only add non-empty filter values
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim()
      }
      if (filters.category_id) {
        params.category_id = filters.category_id
      }
      if (filters.brand_id) {
        params.brand_id = filters.brand_id
      }
      if (filters.is_active !== '') {
        params.is_active = filters.is_active
      }
      
      const response = await adminGetProducts(params)
      setProducts(response.data || [])
      setPagination({
        current_page: response.meta?.current_page || 1,
        last_page: response.meta?.last_page || 1,
        total: response.meta?.total || 0
      })
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await adminGetCategories()
      setCategories(response.data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadBrands = async () => {
    try {
      const response = await adminGetBrands()
      setBrands(response.data || [])
    } catch (error) {
      console.error('Error loading brands:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      return
    }

    try {
      await adminDeleteProduct(id)
      loadData()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Ошибка при удалении товара')
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPagination(prev => ({ ...prev, current_page: 1 }))
  }

  return (
    <div className="admin-products">
      <div className="admin-toolbar">
        <div className="admin-filters">
          <input
            type="text"
            placeholder="Поиск товаров..."
            className="admin-filter-input"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <select
            className="admin-filter-select"
            value={filters.category_id}
            onChange={(e) => handleFilterChange('category_id', e.target.value)}
          >
            <option value="">Все категории</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            className="admin-filter-select"
            value={filters.brand_id}
            onChange={(e) => handleFilterChange('brand_id', e.target.value)}
          >
            <option value="">Все бренды</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
          <select
            className="admin-filter-select"
            value={filters.is_active}
            onChange={(e) => handleFilterChange('is_active', e.target.value)}
          >
            <option value="">Все статусы</option>
            <option value="true">Активные</option>
            <option value="false">Неактивные</option>
          </select>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary">
          + Добавить товар
        </Link>
      </div>

      {loading ? (
        <div className="loading">Загрузка товаров...</div>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Изображение</th>
                  <th>Название</th>
                  <th>Категория</th>
                  <th>Бренд</th>
                  <th>Цена</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={typeof product.images[0] === 'string' 
                            ? product.images[0] 
                            : product.images[0].image_path} 
                          alt={product.name}
                          className="product-thumb"
                        />
                      ) : (
                        <div className="product-thumb-placeholder">Нет фото</div>
                      )}
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category?.name || '-'}</td>
                    <td>{product.brand?.name || '-'}</td>
                    <td>{product.price?.toLocaleString('ru-RU')} ₽</td>
                    <td>
                      <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                        {product.is_active ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <Link 
                          to={`/admin/products/${product.id}/edit`}
                          className="btn-action btn-edit"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="btn-action btn-delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {pagination.last_page > 1 && (
            <div className="admin-pagination">
              <button
                disabled={pagination.current_page === 1}
                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
              >
                Назад
              </button>
              <span>
                Страница {pagination.current_page} из {pagination.last_page}
              </span>
              <button
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
              >
                Вперед
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminProducts
