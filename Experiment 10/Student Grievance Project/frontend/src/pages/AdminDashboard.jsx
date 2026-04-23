import { useEffect, useState } from 'react'
import { getAllGrievances, updateGrievanceStatus, rejectGrievance, updateGrievancePriority, addAdminComment } from '../api'

export default function AdminDashboard() {
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, feedback: '' })
  const [commentModal, setCommentModal] = useState({ open: false, id: null, comment: '' })
  const [priorityModal, setPriorityModal] = useState({ open: false, id: null, priority: 'MEDIUM' })

  const load = async () => {
    try {
      setError('')
      const data = await getAllGrievances()
      setItems(data)
      setFilteredItems(data)
    } catch (e) {
      setError(e.message || 'Failed to load grievances')
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    let filtered = items
    if (searchTerm) {
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.studentName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(g => g.status === statusFilter)
    }
    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(g => g.priority === priorityFilter)
    }
    setFilteredItems(filtered)
  }, [searchTerm, statusFilter, priorityFilter, items])

  const handleReject = async () => {
    if (!rejectModal.feedback.trim()) {
      setError('Please provide rejection feedback')
      return
    }
    setSavingId(rejectModal.id)
    setError('')
    try {
      await rejectGrievance(rejectModal.id, rejectModal.feedback)
      setRejectModal({ open: false, id: null, feedback: '' })
      await load()
    } catch (e) {
      setError(e.message || 'Failed to reject grievance')
    } finally {
      setSavingId(null)
    }
  }

  const handleAddComment = async () => {
    if (!commentModal.comment.trim()) {
      setError('Please enter a comment')
      return
    }
    setSavingId(commentModal.id)
    setError('')
    try {
      await addAdminComment(commentModal.id, commentModal.comment)
      setCommentModal({ open: false, id: null, comment: '' })
      await load()
    } catch (e) {
      setError(e.message || 'Failed to add comment')
    } finally {
      setSavingId(null)
    }
  }

  const handleUpdatePriority = async () => {
    setSavingId(priorityModal.id)
    setError('')
    try {
      await updateGrievancePriority(priorityModal.id, priorityModal.priority)
      setPriorityModal({ open: false, id: null, priority: 'MEDIUM' })
      await load()
    } catch (e) {
      setError(e.message || 'Failed to update priority')
    } finally {
      setSavingId(null)
    }
  }

  const renderActions = (g) => {
    const btnPriority = <button key="priority" className="btn secondary" onClick={() => setPriorityModal({ open: true, id: g.id, priority: g.priority || 'MEDIUM' })} disabled={savingId === g.id}>Change Priority</button>;
    const btnNote = <button key="note" className="btn secondary" onClick={() => setCommentModal({ open: true, id: g.id, comment: '' })} disabled={savingId === g.id}>Add Note</button>;
    const btnInProgress = <button key="inprogress" className="btn secondary" onClick={async () => { setSavingId(g.id); setError(''); try { await updateGrievanceStatus(g.id, 'IN_PROGRESS'); await load(); } catch(e){ setError(e.message || 'Update failed'); } finally { setSavingId(null); } }} disabled={savingId === g.id}>{savingId === g.id ? 'Saving…' : 'In Progress'}</button>;
    const btnResolve = <button key="resolve" className="btn primary" onClick={async () => { setSavingId(g.id); setError(''); try { await updateGrievanceStatus(g.id, 'RESOLVED'); await load(); } catch(e){ setError(e.message || 'Update failed'); } finally { setSavingId(null); } }} disabled={savingId === g.id}>{savingId === g.id ? 'Saving…' : 'Resolve'}</button>;
    const btnReject = <button key="reject" className="btn" style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' }} onClick={() => setRejectModal({ open: true, id: g.id, feedback: '' })} disabled={savingId === g.id}>Reject</button>;

    switch (g.status) {
      case 'OPEN':
        return <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{[btnPriority, btnNote, btnInProgress, btnResolve, btnReject]}</div>;
      
      case 'IN_PROGRESS':
        return <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{[btnPriority, btnNote, btnResolve, btnReject]}</div>;
      
      case 'RESOLVED':
      case 'REJECTED':
        return (
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>
            This grievance has been {g.status.toLowerCase()}. No further actions available.
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="dash">
      <h2>Admin Dashboard</h2>
      
      {/* Search and Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr auto auto' }}>
          <input
            type="text"
            placeholder="Search by title, description, or student name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%' }}
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: 10 }}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            style={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: 10 }}
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      <div className="card">
        <h3>All Grievances ({filteredItems.length})</h3>
        {error && <div className="alert error">{error}</div>}
        {filteredItems.length === 0 && <p className="muted">No grievances found.</p>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
          {filteredItems.map(g => (
            <li key={g.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{g.title}</div>
                    <span style={{ 
                      fontSize: 10, 
                      padding: '3px 6px', 
                      borderRadius: 4, 
                      background: g.priority === 'URGENT' ? 'rgba(239,68,68,0.2)' : g.priority === 'HIGH' ? 'rgba(251,146,60,0.2)' : g.priority === 'MEDIUM' ? 'rgba(59,130,246,0.2)' : 'rgba(34,197,94,0.2)',
                      color: 'var(--text)'
                    }}>{g.priority || 'MEDIUM'}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(g.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <div style={{ color: 'var(--muted)', marginBottom: 12 }}>{g.description}</div>
              <div style={{ marginBottom: 12, fontSize: 13 }}>
                <strong>Status:</strong> <span style={{ 
                  color: g.status === 'RESOLVED' ? '#22c55e' : g.status === 'REJECTED' ? '#ef4444' : g.status === 'IN_PROGRESS' ? '#3b82f6' : 'var(--text)',
                  fontWeight: 600
                }}>{g.status}</span> · <strong>Student:</strong> {g.studentName} (#{g.studentId})
              </div>
              
              {g.rejectionFeedback && (
                <div style={{ marginBottom: 12, padding: 10, background: 'rgba(239,68,68,0.1)', borderRadius: 8, fontSize: 13 }}>
                  <strong>Rejection Feedback:</strong> {g.rejectionFeedback}
                </div>
              )}
              
              {g.adminComments && (
                <div style={{ marginBottom: 12, padding: 10, background: 'rgba(59,130,246,0.1)', borderRadius: 8, fontSize: 13, whiteSpace: 'pre-wrap' }}>
                  <strong>Admin Notes:</strong><br />{g.adminComments}
                </div>
              )}

              {renderActions(g)}
            </li>
          ))}
        </ul>
      </div>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000
        }} onClick={() => setRejectModal({ open: false, id: null, feedback: '' })}>
          <div className="card" style={{ maxWidth: 500, width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3>Reject Grievance</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 16 }}>Please provide feedback for the rejection:</p>
            <textarea
              value={rejectModal.feedback}
              onChange={e => setRejectModal({ ...rejectModal, feedback: e.target.value })}
              placeholder="Enter rejection reason..."
              required
              style={{
                width: '100%',
                minHeight: 100,
                background: 'var(--card)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                padding: 12,
                borderRadius: 10,
                marginBottom: 16,
                fontFamily: 'inherit'
              }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn secondary" onClick={() => setRejectModal({ open: false, id: null, feedback: '' })}>Cancel</button>
              <button className="btn" style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444' }} onClick={handleReject} disabled={savingId === rejectModal.id}>
                {savingId === rejectModal.id ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {commentModal.open && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000
        }} onClick={() => setCommentModal({ open: false, id: null, comment: '' })}>
          <div className="card" style={{ maxWidth: 500, width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3>Add Admin Note</h3>
            <textarea
              value={commentModal.comment}
              onChange={e => setCommentModal({ ...commentModal, comment: e.target.value })}
              placeholder="Enter your note or comment..."
              required
              style={{
                width: '100%',
                minHeight: 100,
                background: 'var(--card)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                padding: 12,
                borderRadius: 10,
                marginBottom: 16,
                fontFamily: 'inherit'
              }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn secondary" onClick={() => setCommentModal({ open: false, id: null, comment: '' })}>Cancel</button>
              <button className="btn primary" onClick={handleAddComment} disabled={savingId === commentModal.id}>
                {savingId === commentModal.id ? 'Adding…' : 'Add Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Priority Modal */}
      {priorityModal.open && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000
        }} onClick={() => setPriorityModal({ open: false, id: null, priority: 'MEDIUM' })}>
          <div className="card" style={{ maxWidth: 400, width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3>Change Priority</h3>
            <select
              value={priorityModal.priority}
              onChange={e => setPriorityModal({ ...priorityModal, priority: e.target.value })}
              style={{
                width: '100%',
                background: 'var(--card)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                padding: 12,
                borderRadius: 10,
                marginBottom: 16
              }}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn secondary" onClick={() => setPriorityModal({ open: false, id: null, priority: 'MEDIUM' })}>Cancel</button>
              <button className="btn primary" onClick={handleUpdatePriority} disabled={savingId === priorityModal.id}>
                {savingId === priorityModal.id ? 'Updating…' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
