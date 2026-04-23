import { useEffect, useState } from 'react'
import { getMyGrievances, submitGrievance } from '../api'

export default function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem('sgp_user'))
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [items, setItems] = useState([])

  const load = async () => {
    try {
      const data = await getMyGrievances(user.id)
      setItems(data)
    } catch (e) {
      // ignore minor errors here
    }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await submitGrievance(user.id, title, description, priority)
      setTitle('')
      setDescription('')
      setPriority('MEDIUM')
      setSuccess('Grievance submitted successfully')
      await load()
    } catch (err) {
      setError(err.message || 'Failed to submit grievance')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dash">
      <h2>Student Dashboard</h2>
      <div className="grid">
        <div className="card">
          <h3>Submit Grievance</h3>
          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}
          <form className="form" onSubmit={handleSubmit}>
            <label>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Short summary" required />
            <label>Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your issue" required />
            <label>Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} style={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: 10 }}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            <button className="btn primary" disabled={loading}>{loading ? 'Submitting…' : 'Submit'}</button>
          </form>
        </div>
        <div className="card">
          <h3>My Submissions</h3>
          {items.length === 0 && <p className="muted">No grievances yet.</p>}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '10px' }}>
            {items.map(g => (
              <li key={g.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600 }}>{g.title}</div>
                  <span style={{ 
                    fontSize: 11, 
                    padding: '4px 8px', 
                    borderRadius: 6, 
                    background: g.priority === 'URGENT' ? 'rgba(239,68,68,0.2)' : g.priority === 'HIGH' ? 'rgba(251,146,60,0.2)' : g.priority === 'MEDIUM' ? 'rgba(59,130,246,0.2)' : 'rgba(34,197,94,0.2)',
                    color: 'var(--text)'
                  }}>{g.priority || 'MEDIUM'}</span>
                </div>
                <div style={{ color: 'var(--muted)', marginBottom: 8 }}>{g.description}</div>
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--muted)' }}>
                  Status: <strong style={{ color: g.status === 'RESOLVED' ? '#22c55e' : g.status === 'REJECTED' ? '#ef4444' : g.status === 'IN_PROGRESS' ? '#3b82f6' : 'var(--text)' }}>{g.status}</strong> · {new Date(g.createdAt).toLocaleString()}
                </div>
                {g.rejectionFeedback && (
                  <div style={{ marginTop: 8, padding: 8, background: 'rgba(239,68,68,0.1)', borderRadius: 6, fontSize: 13 }}>
                    <strong>Rejection Feedback:</strong> {g.rejectionFeedback}
                  </div>
                )}
                {g.adminComments && (
                  <div style={{ marginTop: 8, padding: 8, background: 'rgba(59,130,246,0.1)', borderRadius: 6, fontSize: 13 }}>
                    <strong>Admin Notes:</strong> {g.adminComments}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}



