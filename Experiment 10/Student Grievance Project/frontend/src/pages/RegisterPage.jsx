import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await register(fullName, email, password)
      setSuccess('Registration successful! You can now sign in.')
      setTimeout(() => navigate('/'), 800)
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Create student account</h1>
      <p className="subtitle">Join the portal to submit grievances</p>
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}
      <form onSubmit={handleSubmit} className="form">
        <label>Full name</label>
        <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter full name" required />
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" required />
        <button className="btn primary" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
      </form>
      <div className="muted">Already have an account? <Link to="/">Sign in</Link></div>
    </div>
  )
}





