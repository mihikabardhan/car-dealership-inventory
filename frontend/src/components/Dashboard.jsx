import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import SearchBar from './SearchBar'
import VehicleCard from './VehicleCard'
import VehicleForm from './VehicleForm'

const emptyFilters = { make: '', model: '', category: '', minPrice: '', maxPrice: '' }

export default function Dashboard({ token, user, onLogout }) {
  const [vehicles, setVehicles] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null) // { type: 'success' | 'error', text }
  const [formVehicle, setFormVehicle] = useState(null) // null = closed, {} = adding, car = editing
  const isAdmin = user.role === 'admin'

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

  // runs an api call, shows the result, then refreshes the list
  async function run(action, successText) {
    try {
      await action()
      setMessage({ type: 'success', text: successText })
      await loadVehicles()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  const handlePurchase = (v) => run(() => api.purchase(token, v.id), `You bought a ${v.make} ${v.model}!`)

  const handleDelete = (v) => {
    if (!window.confirm(`Delete ${v.make} ${v.model}?`)) return
    run(() => api.deleteVehicle(token, v.id), 'Vehicle deleted')
  }

  const handleRestock = (v) => {
    const input = window.prompt(`How many ${v.make} ${v.model} units to add?`, '5')
    if (input === null) return
    run(() => api.restock(token, v.id, Number(input)), 'Stock updated')
  }

  // the form throws if the api fails, so the form can show the error itself
  async function handleSave(data) {
    const isEdit = Boolean(formVehicle.id)
    await (isEdit ? api.updateVehicle(token, formVehicle.id, data) : api.addVehicle(token, data))
    setFormVehicle(null)
    setMessage({ type: 'success', text: isEdit ? 'Vehicle updated' : 'Vehicle added' })
    await loadVehicles()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-teal-950 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">AutoHub</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline text-teal-200">{user.email}</span>
            {isAdmin && <span className="bg-amber-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded">ADMIN</span>}
            <button onClick={onLogout} className="bg-teal-800 hover:bg-teal-700 px-3 py-1.5 rounded-lg">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Available Vehicles</h2>
          {isAdmin && (
            <button
              onClick={() => setFormVehicle({})}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2 rounded-lg"
            >
              + Add vehicle
            </button>
          )}
        </div>

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
              <VehicleCard
                key={v.id}
                vehicle={v}
                isAdmin={isAdmin}
                onPurchase={() => handlePurchase(v)}
                onEdit={() => setFormVehicle(v)}
                onRestock={() => handleRestock(v)}
                onDelete={() => handleDelete(v)}
              />
            ))}
          </div>
        )}
      </main>

      {formVehicle && <VehicleForm vehicle={formVehicle} onSave={handleSave} onCancel={() => setFormVehicle(null)} />}
    </div>
  )
}
