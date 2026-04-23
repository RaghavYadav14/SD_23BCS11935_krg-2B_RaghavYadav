import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import { useEffect, useState } from 'react'
import { useTheme } from './context/ThemeContext'

function getStoredUser() {
  const raw = localStorage.getItem('sgp_user')
  return raw ? JSON.parse(raw) : null
}

export default function App() {
  const [user, setUser] = useState(getStoredUser())
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') navigate('/admin')
      if (user.role === 'STUDENT') navigate('/student')
    }
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem('sgp_user')
    setUser(null)
    navigate('/')
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          🎓 Student <span className="brand-accent">Grievance Portal</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {user && (
            <div className="user-area">
              <span>{user.fullName} · {user.role}</span>
              <button className="btn secondary" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<LoginPage onLogin={setUser} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/student" element={user?.role === 'STUDENT' ? <StudentDashboard /> : <Navigate to="/" />} />
          <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="app-footer">© {new Date().getFullYear()} Student Grievance Portal</footer>
    </div>
  )
}





