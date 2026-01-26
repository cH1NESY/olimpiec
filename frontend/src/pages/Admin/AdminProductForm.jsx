import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  adminGetProduct, 
  adminCreateProduct, 
  adminUpdateProduct,
  adminGetCategories,
  adminGetBrands,
  getSizes,
  adminUploadProductImages,
  adminDeleteProductImage,
  adminUpdateImageOrder
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
  const [availableSizes, setAvailableSizes] = useState([])
  
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
    sizes: [], // Array of { size_id, stock_quantity }
    characteristics: []
  })

  const [errors, setErrors] = useState({})
  const [productImages, setProductImages] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)

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
      setAvailableSizes(sizesRes.data || [])

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
          sizes: product.sizes ? product.sizes.map(s => ({
            size_id: s.id,
            stock_quantity: s.pivot?.stock_quantity || 0
          })) : [],
          characteristics: product.characteristics ? product.characteristics.map(c => ({
            name: c.name || '',
            value: c.value || ''
          })) : []
        })
        
        // Load product images
        if (product.images && product.images.length > 0) {
          setProductImages(product.images.map(img => ({
            id: img.id,
            image_path: img.image_url || img.image_path || '',
            image_url: img.image_url || img.image_path || '',
            sort_order: img.sort_order || 0,
            is_main: img.is_main || false
          })))
        }
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

  const handleSizeToggle = (sizeId) => {
    setFormData(prev => {
      const exists = prev.sizes.find(s => s.size_id === sizeId)
      if (exists) {
        return {
          ...prev,
          sizes: prev.sizes.filter(s => s.size_id !== sizeId)
        }
      } else {
        return {
          ...prev,
          sizes: [...prev.sizes, { size_id: sizeId, stock_quantity: 0 }]
        }
      }
    })
  }

  const handleSizeStockChange = (sizeId, quantity) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map(s => 
        s.size_id === sizeId ? { ...s, stock_quantity: parseInt(quantity) || 0 } : s
      )
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (!isEdit || !id) {
      alert('Сначала создайте товар, затем загрузите изображения')
      return
    }

    setUploadingImages(true)
    try {
      const response = await adminUploadProductImages(id, files)
      if (response.success && response.data) {
        // Add new images to the list using image_url from response
        const newImages = response.data.map(img => {
          // Use image_url if available, otherwise construct from image_path
          const imageUrl = img.image_url || (img.image_path ? 
            (img.image_path.startsWith('http') || img.image_path.startsWith('/') 
              ? img.image_path 
              : `/storage/${img.image_path}`) 
            : '')
          
          return {
            id: img.id,
            image_path: imageUrl,
            image_url: imageUrl,
            sort_order: img.sort_order || 0,
            is_main: img.is_main || false
          }
        })
        setProductImages(prev => [...prev, ...newImages].sort((a, b) => a.sort_order - b.sort_order))
        alert('Изображения успешно загружены')
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      alert(error.response?.data?.message || 'Ошибка при загрузке изображений')
    } finally {
      setUploadingImages(false)
      e.target.value = '' // Reset file input
    }
  }

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Удалить это изображение?')) return

    if (!isEdit || !id) return

    try {
      const response = await adminDeleteProductImage(id, imageId)
      if (response.success) {
        setProductImages(prev => prev.filter(img => img.id !== imageId))
        alert('Изображение удалено')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      alert(error.response?.data?.message || 'Ошибка при удалении изображения')
    }
  }

  const handleSetMainImage = async (imageId) => {
    if (!isEdit || !id) return

    const updatedImages = productImages.map(img => ({
      ...img,
      is_main: img.id === imageId
    }))

    try {
      await adminUpdateImageOrder(id, updatedImages.map(img => ({
        id: img.id,
        sort_order: img.sort_order,
        is_main: img.is_main
      })))
      setProductImages(updatedImages)
    } catch (error) {
      console.error('Error updating image order:', error)
      alert('Ошибка при обновлении главного изображения')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      // Calculate total stock from sizes if any sizes are selected
      let totalStock = parseInt(formData.stock_quantity) || 0;
      if (formData.sizes.length > 0) {
        totalStock = formData.sizes.reduce((sum, s) => sum + (parseInt(s.stock_quantity) || 0), 0);
      }

      // Prepare data
      const submitData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        old_price: formData.old_price ? parseFloat(formData.old_price) : null,
        stock_quantity: totalStock,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
        // sizes is already in the correct format: [{ size_id, stock_quantity }]
        characteristics: formData.characteristics.filter(c => c.name && c.value)
      }

      if (isEdit) {
        await adminUpdateProduct(id, submitData)
        alert('Товар успешно обновлен')
      } else {
        const response = await adminCreateProduct(submitData)
        alert('Товар успешно создан')
        // Redirect to edit page to allow image upload
        navigate(`/admin/products/${response.data.id}/edit`)
        return
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
             <label>Общее количество (если нет размеров)</label>
             <input
               type="number"
               name="stock_quantity"
               value={formData.stock_quantity}
               onChange={handleChange}
               min="0"
               disabled={formData.sizes.length > 0}
             />
             {formData.sizes.length > 0 && <small style={{color: '#666'}}>Рассчитывается автоматически как сумма остатков по размерам</small>}
           </div>

        </div>

        <div className="form-section">
          <h3>Размеры и остатки</h3>
          <div className="sizes-grid">
            {availableSizes.map(size => {
              const selectedSize = formData.sizes.find(s => s.size_id === size.id)
              const isSelected = !!selectedSize

              return (
                <div key={size.id} className={`size-item ${isSelected ? 'selected' : ''}`}>
                  <label className="size-checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSizeToggle(size.id)}
                    />
                    <span className="size-name">{size.name}</span>
                  </label>
                  
                  {isSelected && (
                    <div className="size-stock">
                      <label>Кол-во:</label>
                      <input
                        type="number"
                        min="0"
                        value={selectedSize.stock_quantity}
                        onChange={(e) => handleSizeStockChange(size.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="form-section">
          <h3>Изображения товара</h3>
          {isEdit && (
            <>
              <div className="images-upload-area">
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                  style={{ display: 'none' }}
                />
                <label htmlFor="image-upload" className="btn btn-secondary">
                  {uploadingImages ? 'Загрузка...' : '+ Загрузить изображения'}
                </label>
                <small style={{ display: 'block', marginTop: '8px', color: '#666' }}>
                  Можно загрузить несколько изображений. Первое изображение будет главным.
                </small>
              </div>

              {productImages.length > 0 && (
                <div className="images-grid">
                  {productImages.map((img, index) => {
                    const imageUrl = img.image_url || img.image_path || ''
                    return (
                      <div key={img.id} className={`image-item ${img.is_main ? 'main' : ''}`}>
                        <img 
                          src={imageUrl} 
                          alt={`Изображение ${index + 1}`}
                          onError={(e) => {
                            console.error('Image load error:', imageUrl)
                            e.target.src = 'https://via.placeholder.com/200x200?text=No+Image'
                          }}
                        />
                      <div className="image-actions">
                        {!img.is_main && (
                          <button
                            type="button"
                            className="btn-image-action"
                            onClick={() => handleSetMainImage(img.id)}
                            title="Сделать главным"
                          >
                            ⭐
                          </button>
                        )}
                        {img.is_main && (
                          <span className="main-badge">Главное</span>
                        )}
                        <button
                          type="button"
                          className="btn-image-action btn-delete"
                          onClick={() => handleDeleteImage(img.id)}
                          title="Удалить"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
          {!isEdit && (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              После создания товара вы сможете загрузить изображения
            </p>
          )}
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
