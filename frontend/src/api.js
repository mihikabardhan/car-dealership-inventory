// All the calls to the backend live in this file so components stay simple.
const BASE = import.meta.env.VITE_API_URL || ''

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // DELETE returns 204 with no body
  const data = res.status === 204 ? null : await res.json()
  if (!res.ok) {
    throw new Error(data?.error || 'Request failed')
  }
  return data
}

export const api = {
  register: (email, password) => request('/api/auth/register', { method: 'POST', body: { email, password } }),
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),

  getVehicles: (token) => request('/api/vehicles', { token }),
  searchVehicles: (token, filters) => {
    // drop empty filters so the url stays clean
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') params.append(key, value)
    })
    return request(`/api/vehicles/search?${params.toString()}`, { token })
  },
  addVehicle: (token, vehicle) => request('/api/vehicles', { method: 'POST', body: vehicle, token }),
  updateVehicle: (token, id, vehicle) => request(`/api/vehicles/${id}`, { method: 'PUT', body: vehicle, token }),
  deleteVehicle: (token, id) => request(`/api/vehicles/${id}`, { method: 'DELETE', token }),
  purchase: (token, id) => request(`/api/vehicles/${id}/purchase`, { method: 'POST', body: { quantity: 1 }, token }),
  restock: (token, id, quantity) => request(`/api/vehicles/${id}/restock`, { method: 'POST', body: { quantity }, token }),
}
