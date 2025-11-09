import { useState, useEffect } from 'react'
import { getTests } from '../api'

export default function Tests({ user, showToast }) {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTests()
  }, [])

  const loadTests = async () => {
    try {
      setLoading(true)
      const data = await getTests()
      setTests(data || [])
    } catch (error) {
      console.error('Error loading tests:', error)
      showToast('Ошибка загрузки тестов', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="container"><div className="skeleton" style={{ height: 300 }}></div></div>
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: 20 }}>📝 Тесты</h2>
      
      {tests.map(test => (
        <div key={test.id} className="card">
          <h3 style={{ marginBottom: 8 }}>{test.title}</h3>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>{test.description}</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 12, background: '#f0f0f0', padding: '4px 8px', borderRadius: 4 }}>
              ⏱️ {test.duration} мин
            </span>
            <span style={{ fontSize: 12, background: '#f0f0f0', padding: '4px 8px', borderRadius: 4 }}>
              ❓ {test.questions_count} вопросов
            </span>
            <span style={{ fontSize: 12, background: '#f0f0f0', padding: '4px 8px', borderRadius: 4 }}>
              {test.difficulty}
            </span>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }}>
            Начать тест
          </button>
        </div>
      ))}

      {tests.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>📝</div>
          <p>Тесты загружаются...</p>
        </div>
      )}
    </div>
  )
}