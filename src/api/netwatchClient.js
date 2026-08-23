const API = 'http://192.168.15.12:8000'

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${API}${path}`, options)
  } catch {
    throw new Error('Sem conexão com a API')
  }

  if (res.status === 401) {
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const msg =
      body?.detail ||
      body?.message ||
      `Erro ${res.status}`
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }

  return res
}

export async function login(username, password) {
  const body = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
  const res = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = await res.json()
  return data.access_token
}

export async function fetchHistory(token, page = 1) {
  const res = await request(`/history?page=${page}&limit=10`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const json = await res.json()
  return {
    items: json.data ?? [],
    pagination: { total_items: json.total, total_pages: json.pages },
  }
}

export async function fetchScanDetail(token, scanId) {
  const res = await request(`/scan/${scanId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function createScan(token, { targets, ports, protocol }) {
  const res = await request('/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ targets, ports, protocol }),
  })
  return res.json()
}

export async function fetchScanCves(token, scanId) {
  const res = await request(`/scan/${scanId}/cves`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}
