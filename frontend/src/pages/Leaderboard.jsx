import { useState, useEffect } from 'react'
import { getLeaderboard } from '../api'

export default function Leaderboard({ user, showToast }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard()
      setLeaderboard(data || [])
    } catch (error) {
      showToast('Ошибка загрузки', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h2>🏆 Лидерборд</h2>
      {leaderboard.map(leader => (
        <div key={leader.rank} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <strong>{leader.rank}. {leader.name}</strong>
              <p style={{ fontSize: 12, color: '#666' }}>{leader.testsCount} тестов</p>
            </div>
            <div style={{ fontSize: 18, fontWeight: 'bold' }}>{leader.totalScore}</div>
          </div>
        </div>
      ))}
    </div>
  )
}