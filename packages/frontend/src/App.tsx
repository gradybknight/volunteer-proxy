import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import EventList from './pages/EventList'
import Layout from './components/Layout'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/events" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/events" /> : <Register />} />
        <Route
          path="/events"
          element={
            isAuthenticated ? (
              <Layout>
                <EventList />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/" element={<Navigate to="/events" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
