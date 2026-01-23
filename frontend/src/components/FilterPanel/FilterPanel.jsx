import { useState, useEffect } from 'react'
import { getBrands, getSizes } from '../../api/api'
import './FilterPanel.css'

const FilterPanel = ({ filters, onFilterChange, onReset }) => {
  const [brands, setBrands] = useState([])
  const [sizes, setSizes] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    new: true,
    brands: false,
    gender: false,
    sizes: false,
    price: false
  })

  useEffect(() => {
    loadFilterData()
  }, [])

  const loadFilterData = async () => {
    try {
      const [brandsData, sizesData] = await Promise.all([
        getBrands(),
        getSizes()
      ])
      setBrands(brandsData.data || [])
      setSizes(sizesData.data || [])
    } catch (error) {
      console.error('Error loading filter data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBrandChange = (brandSlug) => {
    const newBrands = filters.brands?.includes(brandSlug)
      ? filters.brands.filter(b => b !== brandSlug)
      : [...(filters.brands || []), brandSlug]
    
    onFilterChange({ ...filters, brands: newBrands })
  }

  const handleGenderChange = (gender) => {
    const newGenders = filters.genders?.includes(gender)
      ? filters.genders.filter(g => g !== gender)
      : [...(filters.genders || []), gender]
    
    onFilterChange({ ...filters, genders: newGenders })
  }

  const handleSizeChange = (sizeId) => {
    const newSizes = filters.sizes?.includes(sizeId)
      ? filters.sizes.filter(s => s !== sizeId)
      : [...(filters.sizes || []), sizeId]
    
    onFilterChange({ ...filters, sizes: newSizes })
  }

  const handlePriceChange = (field, value) => {
    onFilterChange({
      ...filters,
      price: {
        ...filters.price,
        [field]: value ? parseFloat(value) : null
      }
    })
  }

  const handleNewProductsChange = (e) => {
    onFilterChange({
      ...filters,
      isNew: e.target.checked
    })
  }

  const hasActiveFilters = () => {
    return (
      (filters.brands && filters.brands.length > 0) ||
      (filters.genders && filters.genders.length > 0) ||
      (filters.sizes && filters.sizes.length > 0) ||
      (filters.price?.min || filters.price?.max) ||
      filters.isNew
    )
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (loading) {
    return (
      <div className="filter-panel">
        <div className="loading">Загрузка фильтров...</div>
      </div>
    )
  }

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <h3 className="filter-panel-title">Фильтры</h3>
        {hasActiveFilters() && (
          <button className="filter-reset-btn" onClick={onReset}>
            Сбросить
          </button>
        )}
      </div>

      {/* Новинки */}
      <div className="filter-section">
        <button 
          className="filter-section-header"
          onClick={() => toggleSection('new')}
        >
          <h4 className="filter-section-title">Новинки</h4>
          <svg
            className={`filter-section-arrow ${expandedSections.new ? 'open' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {expandedSections.new && (
          <div className="filter-section-content">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.isNew || false}
                onChange={handleNewProductsChange}
              />
              <span>Только новинки</span>
            </label>
          </div>
        )}
      </div>

      {/* Бренды */}
      <div className="filter-section">
        <button 
          className="filter-section-header"
          onClick={() => toggleSection('brands')}
        >
          <h4 className="filter-section-title">Бренд</h4>
          <svg
            className={`filter-section-arrow ${expandedSections.brands ? 'open' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {expandedSections.brands && (
          <div className="filter-section-content">
            <div className="filter-checkbox-list">
              {brands.map(brand => (
                <label key={brand.id} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.brands?.includes(brand.slug) || false}
                    onChange={() => handleBrandChange(brand.slug)}
                  />
                  <span>{brand.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Пол */}
      <div className="filter-section">
        <button 
          className="filter-section-header"
          onClick={() => toggleSection('gender')}
        >
          <h4 className="filter-section-title">Пол</h4>
          <svg
            className={`filter-section-arrow ${expandedSections.gender ? 'open' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {expandedSections.gender && (
          <div className="filter-section-content">
            <div className="filter-checkbox-list">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.genders?.includes('male') || false}
                  onChange={() => handleGenderChange('male')}
                />
                <span>Мужской</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.genders?.includes('female') || false}
                  onChange={() => handleGenderChange('female')}
                />
                <span>Женский</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.genders?.includes('unisex') || false}
                  onChange={() => handleGenderChange('unisex')}
                />
                <span>Унисекс</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Размеры */}
      <div className="filter-section">
        <button 
          className="filter-section-header"
          onClick={() => toggleSection('sizes')}
        >
          <h4 className="filter-section-title">Размер</h4>
          <svg
            className={`filter-section-arrow ${expandedSections.sizes ? 'open' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {expandedSections.sizes && (
          <div className="filter-section-content">
            <div className="filter-size-list">
              {sizes.map(size => {
                const isChecked = filters.sizes?.includes(size.id) || false
                return (
                  <label key={size.id} className={`filter-size-checkbox ${isChecked ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleSizeChange(size.id)}
                    />
                    <span>{size.name}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Цена */}
      <div className="filter-section">
        <button 
          className="filter-section-header"
          onClick={() => toggleSection('price')}
        >
          <h4 className="filter-section-title">Цена</h4>
          <svg
            className={`filter-section-arrow ${expandedSections.price ? 'open' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {expandedSections.price && (
          <div className="filter-section-content">
            <div className="filter-price-range">
              <div className="filter-price-input-group">
                <label htmlFor="min-price">От</label>
                <input
                  type="number"
                  id="min-price"
                  className="filter-price-input"
                  placeholder="0"
                  value={filters.price?.min || ''}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  min="0"
                />
              </div>
              <div className="filter-price-input-group">
                <label htmlFor="max-price">До</label>
                <input
                  type="number"
                  id="max-price"
                  className="filter-price-input"
                  placeholder="100000"
                  value={filters.price?.max || ''}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FilterPanel
