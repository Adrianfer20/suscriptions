
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import PublicRoutes from './routes/PublicRoutes'
import AdminRoutes from './routes/AdminRoutes'
import ClientRoutes from './routes/ClientRoutes'
import RootRedirect from './routes/RootRedirect'
import LoadingSpinner from './components/LoadingSpinner'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  return (
    <Routes>
      {PublicRoutes()}
      <Route path="/" element={<RootRedirect user={user} />} />
      {AdminRoutes()}
      {ClientRoutes()}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
