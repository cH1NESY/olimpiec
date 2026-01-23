import { useState, useEffect } from 'react'
import { adminGetBrands, adminCreateBrand, adminUpdateBrand, adminDeleteBrand } from '../../api/api'
import './AdminBrands.css'

const AdminBrands = () => {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: ''
  })

  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    setLoading(true)
    try {
      const response = await adminGetBrands()
      setBrands(response.data || [])
    } catch (error) {
      console.error('Error loading brands:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingBrand) {
        await adminUpdateBrand(editingBrand.id, formData)
      } else {
        await adminCreateBrand(formData)
      }
      setShowForm(false)
      setEditingBrand(null)
      setFormData({ name: '', description: '', logo: '' })
      loadBrands()
    } catch (error) {
      console.error('Error saving brand:', error)
      alert('Ошибка при сохранении бренда')
    }
  }

  const handleEdit = (brand) => {
    setEditingBrand(brand)
    setFormData({
      name: brand.name,
      description: brand.description || '',
      logo: brand.logo || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот бренд?')) {
      return
    }

    try {
      await adminDeleteBrand(id)
      loadBrands()
    } catch (error) {
      console.error('Error deleting brand:', error)
      alert(error.response?.data?.message || 'Ошибка при удалении бренда')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingBrand(null)
    setFormData({ name: '', description: '', logo: '' })
  }

  return (
    <div className="admin-brands">
      <div className="admin-toolbar">
        <h2>Бренды</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Добавить бренд
        </button>
      </div>

      {showForm && (
        <div className="admin-form-modal">
          <div className="admin-form-content">
            <h3>{editingBrand ? 'Редактировать бренд' : 'Создать бренд'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Название *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Логотип (URL)</label>
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingBrand ? 'Сохранить' : 'Создать'}
                </button>
                <button type="button" className="btn btn-outline" onClick={handleCancel}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Загрузка брендов...</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Описание</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {brands.map(brand => (
                <tr key={brand.id}>
                  <td>{brand.id}</td>
                  <td>{brand.name}</td>
                  <td>{brand.description || '-'}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        onClick={() => handleEdit(brand)}
                        className="btn-action btn-edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id)}
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
      )}
    </div>
  )
}

export default AdminBrands
