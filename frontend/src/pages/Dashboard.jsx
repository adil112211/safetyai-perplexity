import { useState, useEffect } from 'react'
import { getStats } from '../api'

export default function Dashboard({ user, showToast }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await getStats()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
      showToast('Ошибка загрузки статистики', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="skeleton" style={{ height: 200, borderRadius: 12, marginBottom: 16 }}></div>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 8 }}>👋 Добро пожаловать!</h1>
        <p style={{ color: '#666' }}>
          {user?.firstName} {user?.lastName}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value">{stats?.testsCompleted || 0}</div>
          <div className="stat-label">Тестов пройдено</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.averageScore || 0}%</div>
          <div className="stat-label">Средний балл</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.certificatesEarned || 0}</div>
          <div className="stat-label">Сертификатов</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.violationsReported || 0}</div>
          <div className="stat-label">Отчетов</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Быстрые действия</h3>
        <button className="btn btn-primary" style={{ width: '100%', marginBottom: 8 }}>
          📚 Начать курс
        </button>
        <button className="btn btn-secondary" style={{ width: '100%', marginBottom: 8 }}>
          📝 Пройти тест
        </button>
        <button className="btn btn-secondary" style={{ width: '100%' }}>
          🚨 Сообщить о нарушении
        </button>
      </div>
    </div>
  )
}