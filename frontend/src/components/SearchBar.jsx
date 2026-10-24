export default function SearchBar({ filters, onChange, onClear }) {
  // update one filter and keep the others
  const set = (field) => (e) => onChange({ ...filters, [field]: e.target.value })

  const inputClass =
    'border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-teal-500'

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-5">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
        <input className={inputClass} placeholder="Make" value={filters.make} onChange={set('make')} />
        <input className={inputClass} placeholder="Model" value={filters.model} onChange={set('model')} />
        <input className={inputClass} placeholder="Category" value={filters.category} onChange={set('category')} />
        <input className={inputClass} type="number" min="0" placeholder="Min price" value={filters.minPrice} onChange={set('minPrice')} />
        <input className={inputClass} type="number" min="0" placeholder="Max price" value={filters.maxPrice} onChange={set('maxPrice')} />
      </div>
      <button onClick={onClear} className="mt-3 text-sm text-teal-700 hover:underline">
        Clear filters
      </button>
    </div>
  )
}
