import { useState } from 'react'
import AuthForm from './components/AuthForm'
import Dashboard from './components/Dashboard'

// Keep the login in localStorage so a page refresh doesn't log you out
function loadSession() {
  try {
    return JSON.parse(localStorage.getItem('session')) || null
  } catch {
    return null
  }
}

export default function App() {
  const [session, setSession] = useState(loadSession)

  function handleLogin(data) {
    localStorage.setItem('session', JSON.stringify(data))
    setSession(data)
  }

  function handleLogout() {
    localStorage.removeItem('session')
    setSession(null)
  }

  if (!session) {
    return <AuthForm onLogin={handleLogin} />
  }

  return <Dashboard token={session.token} user={session.user} onLogout={handleLogout} />
}
