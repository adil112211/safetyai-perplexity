export default function Profile({ user, showToast }) {
  return (
    <div className="container">
      <h2>👤 Профиль</h2>
      <div className="card">
        <h3>{user?.firstName} {user?.lastName}</h3>
        <p>@{user?.username}</p>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }}>
          🚪 Выйти
        </button>
      </div>
    </div>
  )
}