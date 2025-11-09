import { useState, useEffect } from 'react'
import { getCourses } from '../api'

export default function Courses({ user, showToast }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const data = await getCourses()
      setCourses(data || [])
    } catch (error) {
      console.error('Error loading courses:', error)
      showToast('Ошибка загрузки курсов', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="container"><div className="skeleton" style={{ height: 300 }}></div></div>
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: 20 }}>📚 Курсы</h2>
      
      {courses.map(course => (
        <div key={course.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: 8 }}>{course.title}</h3>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>{course.description}</p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 12, background: '#f0f0f0', padding: '4px 8px', borderRadius: 4 }}>
                  ⏱️ {course.duration_minutes} мин
                </span>
                <span style={{ fontSize: 12, background: '#f0f0f0', padding: '4px 8px', borderRadius: 4 }}>
                  📖 {course.lessons_count} уроков
                </span>
                <span style={{ fontSize: 12, background: '#f0f0f0', padding: '4px 8px', borderRadius: 4 }}>
                  {course.difficulty}
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${course.progress || 0}%` }}></div>
              </div>
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }}>
            {course.progress ? 'Продолжить' : 'Начать'}
          </button>
        </div>
      ))}

      {courses.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>📚</div>
          <p>Курсы загружаются...</p>
        </div>
      )}
    </div>
  )
}