import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchProducts } from '../../api/api'
import './SearchBar.css'

const SearchBar = () => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const searchRef = useRef(null)
  const suggestionsRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.trim().length >= 1) {
      performSearch(query)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [query])

  const performSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setSuggestions([])
      setShowSuggestions(false)
      setLoading(false)
      return
    }

    setLoading(true)
    setShowSuggestions(true) // Show suggestions container while loading
    try {
      const response = await searchProducts(searchQuery.trim())
      console.log('Search response:', response) // Debug log
      
      // Handle response structure
      let products = []
      if (response && response.success !== false) {
        if (Array.isArray(response.data)) {
          products = response.data
        } else if (response.data && Array.isArray(response.data)) {
          products = response.data
        } else if (Array.isArray(response)) {
          products = response
        }
      }
      
      console.log('Products found:', products.length, products) // Debug log
      const limitedProducts = products.slice(0, 5)
      setSuggestions(limitedProducts)
      // Always show suggestions container if we have a query, even if no results
      setShowSuggestions(true)
    } catch (error) {
      console.error('Search error:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setQuery(e.target.value)
  }

  const handleSuggestionClick = (product) => {
    setQuery('')
    setShowSuggestions(false)
    navigate(`/product/${product.id}`)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setShowSuggestions(false)
      navigate(`/catalog?search=${encodeURIComponent(query)}`)
      setQuery('')
    }
  }

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0]
      return typeof firstImage === 'string' 
        ? firstImage 
        : (firstImage.image_path || firstImage.url || firstImage.path)
    }
    return product.image || '/api/placeholder/100/100'
  }

  return (
    <div className="search-bar-container" ref={searchRef}>
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          className="search-input"
          placeholder="Поиск товаров..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim().length >= 1 && suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
        />
        <button type="submit" className="search-btn" aria-label="Поиск">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
      </form>

      {query.trim().length > 0 && (
        <div className="search-suggestions" ref={suggestionsRef}>
          {loading && <div className="search-loading">Поиск...</div>}
          {!loading && suggestions.length === 0 && (
            <div className="search-loading">Товары не найдены</div>
          )}
          {!loading && suggestions.length > 0 && suggestions.map((product, index) => (
            <div
              key={product.id || index}
              className="search-suggestion-item"
              onClick={() => handleSuggestionClick(product)}
            >
              <img
                src={getProductImage(product)}
                alt={product.name}
                className="suggestion-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/60x60?text=No+Image'
                }}
              />
              <div className="suggestion-info">
                <div className="suggestion-name">{product.name}</div>
                <div className="suggestion-price">
                  {product.price?.toLocaleString('ru-RU')} ₽
                </div>
              </div>
            </div>
          ))}
          {query && (
            <div
              className="search-suggestion-view-all"
              onClick={handleSubmit}
            >
              Показать все результаты для "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
