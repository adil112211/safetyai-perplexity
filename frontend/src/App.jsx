import { useState, useEffect } from 'react'
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
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    initializeUser()
  }, [])

  const initializeUser = async () => {
    try {
      // ✅ Получаем данные из Telegram
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      const initData = window.Telegram?.WebApp?.initData;

      if (tgUser && initData) {
        console.log('👤 Telegram user:', tgUser);
        
        // ✅ Отправляем на Backend для регистрации/поиска
        const response = await fetch(
          'https://safetyai-perplexity.vercel.app/api/auth/validate',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${initData}`
            }
          }
        );

        const data = await response.json();

        if (data.success && data.user) {
          console.log('✅ User authenticated:', data.user);
          setUser(data.user);
        } else {
          console.error('Auth failed:', data.error);
          // Demo mode
          setUser({
            id: 'demo-' + Date.now(),
            firstName: 'Demo',
            lastName: 'User',
            username: 'demo',
            telegramId: 0
          });
        }
      } else {
        // Demo mode если нет Telegram данных
        setUser({
          id: 'demo-' + Date.now(),
          firstName: 'Demo',
          lastName: 'User',
          username: 'demo',
          telegramId: 0
        });
      }
    } catch (error) {
      console.error('Init error:', error);
      setUser({
        id: 'demo-' + Date.now(),
        firstName: 'Demo',
        lastName: 'User',
        username: 'demo',
        telegramId: 0
      });
    } finally {
      setLoading(false);
    }
  };

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
