const BASE_URL = 'http://localhost:8080/api'

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function register(fullName, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, password })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function submitGrievance(studentId, title, description, priority = 'MEDIUM') {
  const res = await fetch(`${BASE_URL}/grievances`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, title, description, priority })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getMyGrievances(studentId) {
  const url = `${BASE_URL}/grievances/mine?studentId=${encodeURIComponent(studentId)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getAllGrievances() {
  const res = await fetch(`${BASE_URL}/grievances/all`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateGrievanceStatus(id, status) {
  const res = await fetch(`${BASE_URL}/grievances/${id}/status?status=${encodeURIComponent(status)}`, {
    method: 'PUT'
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function rejectGrievance(id, feedback) {
  const res = await fetch(`${BASE_URL}/grievances/${id}/reject`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feedback })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateGrievancePriority(id, priority) {
  const res = await fetch(`${BASE_URL}/grievances/${id}/priority`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priority })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function addAdminComment(id, comment) {
  const res = await fetch(`${BASE_URL}/grievances/${id}/comment`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment })
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}



