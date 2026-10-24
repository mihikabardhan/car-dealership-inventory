// badge colour depends on the category
const badgeColors = {
  sedan: 'bg-sky-100 text-sky-800',
  suv: 'bg-lime-100 text-lime-800',
  coupe: 'bg-rose-100 text-rose-800',
  electric: 'bg-emerald-100 text-emerald-800',
  hatchback: 'bg-amber-100 text-amber-800',
}

export default function VehicleCard({ vehicle, onPurchase }) {
  const outOfStock = vehicle.quantity === 0
  const badge = badgeColors[vehicle.category.toLowerCase()] || 'bg-gray-100 text-gray-700'

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
      {/* simple banner using the make's first letter instead of an image */}
      <div className="h-28 bg-teal-800 flex items-center justify-center text-5xl font-bold text-teal-200">
        {vehicle.make[0]}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {vehicle.make} {vehicle.model}
            </h3>
            <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${badge}`}>
              {vehicle.category}
            </span>
          </div>
          <p className="text-xl font-bold text-teal-700">${vehicle.price.toLocaleString()}</p>
        </div>

        <p className={`text-sm mt-3 ${outOfStock ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
          {outOfStock ? 'Out of stock' : `${vehicle.quantity} in stock`}
        </p>

        <button
          onClick={onPurchase}
          disabled={outOfStock}
          className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {outOfStock ? 'Sold out' : 'Purchase'}
        </button>
      </div>
    </div>
  )
}
