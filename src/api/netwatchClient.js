const API = 'http://192.168.15.12:8000'

export async function login(username, password) {
   const body = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error('Usuário ou senha inválidos')
  const data = await res.json()
  return data.access_token
}

export async function fetchHistory(token, page = 1) {
  const res = await fetch(`${API}/history?page=${page}&limit=10`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Falha ao buscar histórico')
  const json = await res.json()
  return { items: json.data ?? [], pagination: { total_items: json.total, total_pages: json.pages } }
}

export async function fetchScanDetail(token, scanId) {
  const res = await fetch(`${API}/scan/${scanId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Falha ao buscar scan')
  return res.json()
}

export async function createScan(token, { targets, ports, protocol }) {
  const res = await fetch(`${API}/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ targets, ports, protocol }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.detail ?? 'Falha ao executar scan')
  }
  return res.json()
}

export async function fetchScanCves(token, scanId) {
  const res = await fetch(`${API}/scan/${scanId}/cves`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Falha ao buscar CVEs do scan')
  return res.json()
}