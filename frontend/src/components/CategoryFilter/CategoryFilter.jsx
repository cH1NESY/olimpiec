import { useState, useRef, useEffect } from 'react'
import './CategoryFilter.css'

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Get selected category name
  const selectedCategoryName = selectedCategory
    ? categories.find(cat => cat.slug === selectedCategory)?.name || 'Выберите категорию'
    : 'Все категории'

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCategorySelect = (slug) => {
    onCategoryChange(slug)
    setIsOpen(false)
  }

  return (
    <div className="category-filter" ref={dropdownRef}>
      <button
        className="category-filter-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="category-filter-label">
          <span className="category-filter-icon">📁</span>
          <span className="category-filter-text">{selectedCategoryName}</span>
        </span>
        <svg
          className={`category-filter-arrow ${isOpen ? 'open' : ''}`}
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

      {isOpen && (
        <div className="category-filter-dropdown">
          <div className="category-filter-list">
            <button
              className={`category-filter-item ${!selectedCategory ? 'active' : ''}`}
              onClick={() => handleCategorySelect('')}
            >
              Все категории
            </button>
            {categories.map(category => (
              <button
                key={category.id || category.slug}
                className={`category-filter-item ${selectedCategory === category.slug ? 'active' : ''}`}
                onClick={() => handleCategorySelect(category.slug)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryFilter
