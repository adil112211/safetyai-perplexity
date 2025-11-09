import { useState, useEffect } from 'react'
import { createViolation, getViolations } from '../api'

export default function Violations({ user, showToast }) {
  const [violations, setViolations] = useState([])
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Другое')

  useEffect(() => {
    loadViolations()
  }, [])

  const loadViolations = async () => {
    try {
      const data = await getViolations()
      setViolations(data || [])
    } catch (error) {
      showToast('Ошибка загрузки', 'error')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createViolation(description, category, null)
      showToast('Отчет отправлен', 'success')
      setDescription('')
      setCategory('Другое')
      loadViolations()
    } catch (error) {
      showToast('Ошибка отправки', 'error')
    }
  }

  return (
    <div className="container">
      <h2>🚨 Отчеты</h2>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание..."
              rows={4}
            />
          </div>
          <div className="form-group">
            <label>Категория</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Другое</option>
              <option>Нет каски</option>
              <option>Неисправное оборудование</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Отправить
          </button>
        </form>
      </div>
      {violations.map(v => (
        <div key={v.id} className="card">
          <h4>{v.category}</h4>
          <p>{v.description}</p>
        </div>
      ))}
    </div>
  )
}