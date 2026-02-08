import { useState, useEffect } from 'react'
import { adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../../api/api'
import './AdminCategories.css'

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
    sort_order: 0
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const response = await adminGetCategories()
      setCategories(response.data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Prepare data - convert empty string to null for parent_id
      const submitData = {
        ...formData,
        parent_id: formData.parent_id === '' ? null : (formData.parent_id ? parseInt(formData.parent_id) : null),
        sort_order: parseInt(formData.sort_order) || 0
      }

      if (editingCategory) {
        await adminUpdateCategory(editingCategory.id, submitData)
      } else {
        await adminCreateCategory(submitData)
      }
      setShowForm(false)
      setEditingCategory(null)
      setFormData({ name: '', description: '', parent_id: '', sort_order: 0 })
      loadCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.parent_id?.[0] || 'Ошибка при сохранении категории'
      alert(errorMessage)
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      parent_id: category.parent_id || '',
      sort_order: category.sort_order || 0
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      return
    }

    try {
      await adminDeleteCategory(id)
      loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert(error.response?.data?.message || 'Ошибка при удалении категории')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCategory(null)
    setFormData({ name: '', description: '', parent_id: '', sort_order: 0 })
  }

  const getCategoryPath = (category) => {
    if (!category.parent_id) return category.name
    const parent = categories.find(c => c.id === category.parent_id)
    return parent ? `${parent.name} > ${category.name}` : category.name
  }

  return (
    <div className="admin-categories">
      <div className="admin-toolbar">
        <h2>Категории</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Добавить категорию
        </button>
      </div>

      {showForm && (
        <div className="admin-form-modal">
          <div className="admin-form-content">
            <h3>{editingCategory ? 'Редактировать категорию' : 'Создать категорию'}</h3>
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
                <label>Родительская категория</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                >
                  <option value="">Нет (корневая категория)</option>
                  {categories
                    .filter(c => !c.parent_id && c.id !== editingCategory?.id)
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label>Порядок сортировки</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? 'Сохранить' : 'Создать'}
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
        <div className="loading">Загрузка категорий...</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Путь</th>
                <th>Порядок</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>{getCategoryPath(category)}</td>
                  <td>{category.sort_order}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        onClick={() => handleEdit(category)}
                        className="btn-action btn-edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
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

export default AdminCategories
