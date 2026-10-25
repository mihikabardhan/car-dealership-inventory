import { useState } from 'react'

// Modal used for both adding and editing. If the vehicle has an id we are editing.
export default function VehicleForm({ vehicle, onSave, onCancel }) {
  const [form, setForm] = useState({
    make: vehicle.make || '',
    model: vehicle.model || '',
    category: vehicle.category || '',
    price: vehicle.price ?? '',
    quantity: vehicle.quantity ?? '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      // inputs give us strings, the api wants numbers
      await onSave({ ...form, price: Number(form.price), quantity: Number(form.quantity) })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-10">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold text-gray-900">{vehicle.id ? 'Edit vehicle' : 'Add vehicle'}</h2>

        <div className="grid grid-cols-2 gap-3">
          <input className={inputClass} placeholder="Make" required value={form.make} onChange={set('make')} />
          <input className={inputClass} placeholder="Model" required value={form.model} onChange={set('model')} />
        </div>
        <input className={inputClass} placeholder="Category (SUV, Sedan...)" required value={form.category} onChange={set('category')} />
        <div className="grid grid-cols-2 gap-3">
          <input className={inputClass} type="number" min="0" step="0.01" placeholder="Price" required value={form.price} onChange={set('price')} />
          <input className={inputClass} type="number" min="0" step="1" placeholder="Quantity" required value={form.quantity} onChange={set('quantity')} />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
