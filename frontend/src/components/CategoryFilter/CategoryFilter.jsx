import './CategoryFilter.css'

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="category-filter">
      <h3 className="filter-title">Категории</h3>
      <div className="filter-list">
        <button
          className={`filter-item ${!selectedCategory ? 'active' : ''}`}
          onClick={() => onCategoryChange('')}
        >
          Все категории
        </button>
        {categories.map(category => (
          <button
            key={category.id || category.slug}
            className={`filter-item ${selectedCategory === category.slug ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.slug)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryFilter
