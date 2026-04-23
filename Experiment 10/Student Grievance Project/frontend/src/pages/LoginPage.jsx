import { useState } from 'react'
import { Link } from 'react-router-dom'
import { login } from '../api'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      localStorage.setItem('sgp_user', JSON.stringify(user))
      onLogin(user)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to track, resolve, and celebrate progress.</p>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={handleSubmit} className="form">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          <button className="btn primary" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>
        <div className="muted">New here? <Link to="/register">Create a student account</Link></div>
      </div>

      <div className="side-card">
        <div className="feature-badge">Designed for quick resolutions</div>
        <h3>Everything you need to keep campus voices heard.</h3>
        <ul className="side-list">
          <li>
            <span className="dot"></span>
            Real-time updates from submission to closure.
          </li>
          <li>
            <span className="dot"></span>
            Transparent conversations between students & administrators.
          </li>
          <li>
            <span className="dot"></span>
            Priority-based queue to highlight urgent matters.
          </li>
        </ul>
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Portal Access</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">~2 hrs</div>
            <div className="stat-label">Avg admin response</div>
          </div>
        </div>
      </div>
    </div>
  )
}





