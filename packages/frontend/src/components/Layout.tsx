import { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { currentUser, logout } = useAuth()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ padding: '1rem', backgroundColor: '#007bff', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0 }}>Volunteer Proxy System</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {currentUser && (
            <span>
              {currentUser.firstName} {currentUser.lastName} ({currentUser.role})
            </span>
          )}
          <button onClick={logout} style={{ backgroundColor: 'white', color: '#007bff' }}>
            Logout
          </button>
        </div>
      </nav>
      <main style={{ flex: 1, padding: '2rem' }}>{children}</main>
    </div>
  )
}
