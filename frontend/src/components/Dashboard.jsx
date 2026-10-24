import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import SearchBar from './SearchBar'
import VehicleCard from './VehicleCard'

const emptyFilters = { make: '', model: '', category: '', minPrice: '', maxPrice: '' }

export default function Dashboard({ token, user, onLogout }) {
  const [vehicles, setVehicles] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null) // { type: 'success' | 'error', text }

  const loadVehicles = useCallback(async () => {
    try {
      setVehicles(await api.searchVehicles(token, filters))
    } catch (err) {
      // an expired or bad token means we have to log in again
      if (/token/i.test(err.message)) return onLogout()
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }, [token, filters, onLogout])

  // wait 300ms after the last keystroke before calling the api
  useEffect(() => {
    const timer = setTimeout(loadVehicles, 300)
    return () => clearTimeout(timer)
  }, [loadVehicles])

  // hide the banner after a few seconds
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 3500)
    return () => clearTimeout(timer)
  }, [message])

  async function handlePurchase(vehicle) {
    try {
      await api.purchase(token, vehicle.id)
      setMessage({ type: 'success', text: `You bought a ${vehicle.make} ${vehicle.model}!` })
      await loadVehicles() // refresh so the stock number updates
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-teal-950 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">AutoHub</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline text-teal-200">{user.email}</span>
            {user.role === 'admin' && (
              <span className="bg-amber-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded">ADMIN</span>
            )}
            <button onClick={onLogout} className="bg-teal-800 hover:bg-teal-700 px-3 py-1.5 rounded-lg">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Vehicles</h2>

        <SearchBar filters={filters} onChange={setFilters} onClear={() => setFilters(emptyFilters)} />

        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg text-sm ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading vehicles...</p>
        ) : vehicles.length === 0 ? (
          <p className="text-gray-500 bg-white rounded-xl p-8 text-center">No vehicles match your search.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} onPurchase={() => handlePurchase(v)} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
