import { useState, useEffect } from 'react'
import { getStats } from './api'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import Tests from './pages/Tests'
import Violations from './pages/Violations'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import './styles.css'

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    // Сразу устанавливаем демо-пользователя
    setUser({
      id: 1,
      firstName: 'Demo',
      lastName: 'User',
      username: 'demo_user'
    })
    setLoading(false)
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  if (loading) {
    return <div className="container"><div style={{ textAlign: 'center', marginTop: 40 }}>Загружаю...</div></div>
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard user={user} showToast={showToast} />
      case 'courses': return <Courses user={user} showToast={showToast} />
      case 'tests': return <Tests user={user} showToast={showToast} />
      case 'violations': return <Violations user={user} showToast={showToast} />
      case 'leaderboard': return <Leaderboard user={user} showToast={showToast} />
      case 'profile': return <Profile user={user} showToast={showToast} />
      default: return <Dashboard user={user} showToast={showToast} />
    }
  }

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>{renderPage()}</div>
      <nav className="bottom-nav">
        <div className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentPage('dashboard')}>
          <div>🏠</div>
          <div>Home</div>
        </div>
        <div className={`nav-item ${currentPage === 'courses' ? 'active' : ''}`} onClick={() => setCurrentPage('courses')}>
          <div>📚</div>
          <div>Курсы</div>
        </div>
        <div className={`nav-item ${currentPage === 'tests' ? 'active' : ''}`} onClick={() => setCurrentPage('tests')}>
          <div>📝</div>
          <div>Тесты</div>
        </div>
        <div className={`nav-item ${currentPage === 'violations' ? 'active' : ''}`} onClick={() => setCurrentPage('violations')}>
          <div>🚨</div>
          <div>Отчеты</div>
        </div>
        <div className={`nav-item ${currentPage === 'leaderboard' ? 'active' : ''}`} onClick={() => setCurrentPage('leaderboard')}>
          <div>🏆</div>
          <div>Рейтинг</div>
        </div>
        <div className={`nav-item ${currentPage === 'profile' ? 'active' : ''}`} onClick={() => setCurrentPage('profile')}>
          <div>👤</div>
          <div>Профиль</div>
        </div>
      </nav>
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  )
}
