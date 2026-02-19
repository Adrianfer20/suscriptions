import { Routes, Route, Navigate } from 'react-router-dom'
import { initFirebase } from './firebase'
import Login from './pages/Login'
import { ProtectedRoute } from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import AdminDashboard from './views/AdminDashboard'
import AdminClients from './views/admin/AdminClients'
import AdminSubscriptions from './views/admin/AdminSubscriptions'
import AdminClientEdit from './views/admin/AdminClientEdit'
import AdminCommunication from './views/admin/AdminCommunication'
import AdminAutomation from './views/admin/AdminAutomation'
import AdminProfile from './views/admin/AdminProfile'
import AdminUsers from './views/admin/AdminUsers'
import ClientDashboard from './views/client/ClientDashboard'
import ClientSubscription from './views/client/ClientSubscription'
import ClientPayments from './views/client/ClientPayments'
import ClientProfile from './views/client/ClientProfile'
import { useAuth } from './auth'

initFirebase()

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <div style={{ padding: 20 }}>Cargando autenticación...</div>

  return (
    <Routes>
      {/* Public: solo login */}
      <Route path="/login" element={<Login />} />

      {/* Root: redirige según rol si está autenticado, sino a /login */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === 'admin' ? '/admin' : '/client'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Protected admin routes */}
      <Route path="/admin" element={
          <ProtectedRoute roles={["admin"]}>
              <AppLayout />
          </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="client/:uid" element={<AdminClientEdit />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="communication" element={<AdminCommunication />} />
        <Route path="automation" element={<AdminAutomation />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="me" element={<AdminProfile />} />
      </Route>

      {/* Protected client routes */}
      <Route
        path="/client/*"
        element={
          <ProtectedRoute roles={["client"]}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientDashboard />} />
        <Route path="subscription" element={<ClientSubscription />} />
        <Route path="payments" element={<ClientPayments />} />
        <Route path="profile" element={<ClientProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
