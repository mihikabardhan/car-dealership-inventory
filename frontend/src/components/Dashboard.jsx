// temporary placeholder, the real dashboard comes in the next step
export default function Dashboard({ user, onLogout }) {
  return (
    <div className="p-8">
      <p>Logged in as {user.email} ({user.role})</p>
      <button onClick={onLogout} className="mt-4 bg-gray-800 text-white px-4 py-2 rounded-lg">
        Logout
      </button>
    </div>
  )
}
