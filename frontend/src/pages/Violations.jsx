import { useState, useEffect } from 'react'
import { createViolation, getViolations } from '../api'

export default function Violations({ user, showToast }) {
  const [violations, setViolations] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    severity: 'medium'
  })

  useEffect(() => {
    loadViolations()
  }, [])

  const loadViolations = async () => {
    try {
      setLoading(true)
      const data = await getViolations()
      setViolations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Load violations error:', error)
      showToast('Ошибка загрузки отчетов', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description) {
      showToast('Заполни все поля', 'error')
      return
    }

    try {
      await createViolation({
        ...formData,
        userId: user?.id,
        timestamp: new Date().toISOString()
      })
      
      showToast('Отчет отправлен!', 'success')
      setFormData({ title: '', description: '', location: '', severity: 'medium' })
      loadViolations()
    } catch (error) {
      showToast('Ошибка при отправке отчета', 'error')
    }
  }

  if (loading) {
    return <div className="container" style={{ marginTop: 40, textAlign: 'center' }}>Загружаю отчеты...</div>
  }

  return (
    <div className="container">
      <h2>🚨 Отчеты о нарушениях</h2>

      <form onSubmit={handleSubmit} style={{
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24
      }}>
        <h3 style={{ marginTop: 0 }}>Новый отчет</h3>
        
        <input
          type="text"
          placeholder="Заголовок нарушения"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          style={{
            width: '100%',
            padding: 12,
            marginBottom: 12,
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            fontSize: 14,
            boxSizing: 'border-box'
          }}
        />

        <textarea
          placeholder="Описание нарушения"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          style={{
            width: '100%',
            padding: 12,
            marginBottom: 12,
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            fontSize: 14,
            minHeight: 100,
            fontFamily: 'inherit',
            boxSizing: 'border-box'
          }}
        />

        <input
          type="text"
          placeholder="Место нарушения"
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
          style={{
            width: '100%',
            padding: 12,
            marginBottom: 12,
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            fontSize: 14,
            boxSizing: 'border-box'
          }}
        />

        <select
          value={formData.severity}
          onChange={(e) => setFormData({...formData, severity: e.target.value})}
          style={{
            width: '100%',
            padding: 12,
            marginBottom: 12,
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            fontSize: 14,
            boxSizing: 'border-box'
          }}
        >
          <option value="low">🟢 Низкий</option>
          <option value="medium">🟡 Средний</option>
          <option value="high">🔴 Высокий</option>
          <option value="critical">🟣 Критический</option>
        </select>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: 12,
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 'bold'
          }}
        >
          Отправить отчет
        </button>
      </form>

      <h3>История отчетов</h3>
      {violations.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', marginTop: 24 }}>
          Нет отчетов
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12, marginBottom: 80 }}>
          {violations.map((v, idx) => (
            <div key={idx} style={{
              border: '1px solid #e0e0e0',
              borderRadius: 12,
              padding: 12,
              backgroundColor: '#f9f9f9'
            }}>
              <h4 style={{ margin: '0 0 8px 0' }}>{v.title}</h4>
              <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: 14 }}>
                {v.description}
              </p>
              <div style={{ fontSize: 12, color: '#999' }}>
                📍 {v.location} • Статус: {v.severity}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
