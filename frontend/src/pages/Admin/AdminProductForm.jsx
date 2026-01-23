import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  adminGetProduct, 
  adminCreateProduct, 
  adminUpdateProduct,
  adminGetCategories,
  adminGetBrands,
  getSizes
} from '../../api/api'
import './AdminProductForm.css'

const AdminProductForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [sizes, setSizes] = useState([])
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    full_description: '',
    price: '',
    old_price: '',
    category_id: '',
    brand_id: '',
    gender: 'unisex',
    is_new: false,
    is_active: true,
    sku: '',
    stock_quantity: 0,
    sizes: [],
    characteristics: []
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadFormData()
  }, [id])

  const loadFormData = async () => {
    setLoadingData(true)
    try {
      // Load categories, brands, sizes
      const [categoriesRes, brandsRes, sizesRes] = await Promise.all([
        adminGetCategories(),
        adminGetBrands(),
        getSizes()
      ])
      
      setCategories(categoriesRes.data || [])
      setBrands(brandsRes.data || [])
      setSizes(sizesRes.data || [])

      // If editing, load product data
      if (isEdit) {
        const productRes = await adminGetProduct(id)
        const product = productRes.data
        
        setFormData({
          name: product.name || '',
          description: product.description || '',
          full_description: product.full_description || '',
          price: product.price || '',
          old_price: product.old_price || '',
          category_id: product.category_id || '',
          brand_id: product.brand_id || '',
          gender: product.gender || 'unisex',
          is_new: product.is_new || false,
          is_active: product.is_active !== undefined ? product.is_active : true,
          sku: product.sku || '',
          stock_quantity: product.stock_quantity || 0,
          sizes: product.sizes ? product.sizes.map(s => s.id || s) : [],
          characteristics: product.characteristics ? product.characteristics.map(c => ({
            name: c.name || '',
            value: c.value || ''
          })) : []
        })
      }
    } catch (error) {
      console.error('Error loading form data:', error)
      alert('Ошибка при загрузке данных')
    } finally {
      setLoadingData(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSizeChange = (sizeId) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(sizeId)
        ? prev.sizes.filter(id => id !== sizeId)
        : [...prev.sizes, sizeId]
    }))
  }

  const handleCharacteristicChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      characteristics: prev.characteristics.map((char, i) => 
        i === index ? { ...char, [field]: value } : char
      )
    }))
  }

  const addCharacteristic = () => {
    setFormData(prev => ({
      ...prev,
      characteristics: [...prev.characteristics, { name: '', value: '' }]
    }))
  }

  const removeCharacteristic = (index) => {
    setFormData(prev => ({
      ...prev,
      characteristics: prev.characteristics.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      // Prepare data
      const submitData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        old_price: formData.old_price ? parseFloat(formData.old_price) : null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
        sizes: formData.sizes.map(id => parseInt(id)),
        characteristics: formData.characteristics.filter(c => c.name && c.value)
      }

      if (isEdit) {
        await adminUpdateProduct(id, submitData)
        alert('Товар успешно обновлен')
      } else {
        await adminCreateProduct(submitData)
        alert('Товар успешно создан')
      }
      
      navigate('/admin/products')
    } catch (error) {
      console.error('Error saving product:', error)
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        alert(error.response?.data?.message || 'Ошибка при сохранении товара')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return <div className="loading">Загрузка данных...</div>
  }

  return (
    <div className="admin-product-form">
      <div className="admin-form-header">
        <h2>{isEdit ? 'Редактирование товара' : 'Создание товара'}</h2>
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={() => navigate('/admin/products')}
        >
          ← Назад к списку
        </button>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-section">
          <h3>Основная информация</h3>
          
          <div className="form-group">
            <label>Название товара *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name[0]}</span>}
          </div>

          <div className="form-group">
            <label>Краткое описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Полное описание</label>
            <textarea
              name="full_description"
              value={formData.full_description}
              onChange={handleChange}
              rows="5"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Цена *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className={errors.price ? 'error' : ''}
              />
              {errors.price && <span className="error-text">{errors.price[0]}</span>}
            </div>

            <div className="form-group">
              <label>Старая цена</label>
              <input
                type="number"
                name="old_price"
                value={formData.old_price}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Категория *</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className={errors.category_id ? 'error' : ''}
              >
                <option value="">Выберите категорию</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <span className="error-text">{errors.category_id[0]}</span>}
            </div>

            <div className="form-group">
              <label>Бренд</label>
              <select
                name="brand_id"
                value={formData.brand_id}
                onChange={handleChange}
              >
                <option value="">Без бренда</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Пол *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
                <option value="unisex">Унисекс</option>
              </select>
            </div>

            <div className="form-group">
              <label>Артикул (SKU)</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className={errors.sku ? 'error' : ''}
              />
              {errors.sku && <span className="error-text">{errors.sku[0]}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Количество на складе</label>
            <input
              type="number"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Размеры</h3>
          <div className="sizes-grid">
            {sizes.map(size => (
              <label key={size.id} className="size-checkbox">
                <input
                  type="checkbox"
                  checked={formData.sizes.includes(size.id)}
                  onChange={() => handleSizeChange(size.id)}
                />
                <span>{size.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Характеристики</h3>
          {formData.characteristics.map((char, index) => (
            <div key={index} className="characteristic-row">
              <input
                type="text"
                placeholder="Название характеристики"
                value={char.name}
                onChange={(e) => handleCharacteristicChange(index, 'name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Значение"
                value={char.value}
                onChange={(e) => handleCharacteristicChange(index, 'value', e.target.value)}
              />
              <button
                type="button"
                className="btn-remove"
                onClick={() => removeCharacteristic(index)}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addCharacteristic}
          >
            + Добавить характеристику
          </button>
        </div>

        <div className="form-section">
          <h3>Дополнительные настройки</h3>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_new"
                checked={formData.is_new}
                onChange={handleChange}
              />
              <span>Новинка</span>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <span>Активен (товар виден на сайте)</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/admin/products')}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Сохранение...' : (isEdit ? 'Сохранить изменения' : 'Создать товар')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminProductForm
