import { useState, useEffect } from 'react'
import { validateUser, getStats, getCourses, getTests, getCertificates, getViolations, getLeaderboard } from './api'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import Tests from './pages/Tests'
import Violations from './pages/Violations'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import AIAssistant from './pages/AIAssistant'
import './styles.css'

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      setLoading(true)
      const userData = await validateUser()
      setUser(userData)
      setError(null)
    } catch (err) {
      console.error('Auth error:', err)
      setError('Ошибка авторизации. Пожалуйста, откройте приложение из Telegram.')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="skeleton" style={{ width: 100, height: 100, borderRadius: '50%', margin: '0 auto 20px' }}></div>
          <div className="skeleton" style={{ width: 200, height: 20, margin: '10px auto' }}></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
          <h2>{error}</h2>
          <button className="btn btn-primary" onClick={initializeApp} style={{ marginTop: 20 }}>
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} showToast={showToast} />
      case 'courses':
        return <Courses user={user} showToast={showToast} />
      case 'tests':
        return <Tests user={user} showToast={showToast} />
      case 'violations':
        return <Violations user={user} showToast={showToast} />
      case 'leaderboard':
        return <Leaderboard user={user} showToast={showToast} />
      case 'ai':
        return <AIAssistant user={user} showToast={showToast} />
      case 'profile':
        return <Profile user={user} onLogout={() => window.location.reload()} showToast={showToast} />
      default:
        return <Dashboard user={user} showToast={showToast} />
    }
  }

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {renderPage()}
      </div>

      <nav className="bottom-nav">
        <div className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentPage('dashboard')}>
          <div className="nav-icon">🏠</div>
          <div>Home</div>
        </div>
        <div className={`nav-item ${currentPage === 'courses' ? 'active' : ''}`} onClick={() => setCurrentPage('courses')}>
          <div className="nav-icon">📚</div>
          <div>Курсы</div>
        </div>
        <div className={`nav-item ${currentPage === 'tests' ? 'active' : ''}`} onClick={() => setCurrentPage('tests')}>
          <div className="nav-icon">📝</div>
          <div>Тесты</div>
        </div>
        <div className={`nav-item ${currentPage === 'violations' ? 'active' : ''}`} onClick={() => setCurrentPage('violations')}>
          <div className="nav-icon">🚨</div>
          <div>Отчеты</div>
        </div>
        <div className={`nav-item ${currentPage === 'leaderboard' ? 'active' : ''}`} onClick={() => setCurrentPage('leaderboard')}>
          <div className="nav-icon">🏆</div>
          <div>Рейтинг</div>
        </div>
        <div className={`nav-item ${currentPage === 'profile' ? 'active' : ''}`} onClick={() => setCurrentPage('profile')}>
          <div className="nav-icon">👤</div>
          <div>Профиль</div>
        </div>
      </nav>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}