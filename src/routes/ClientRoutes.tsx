import { Route } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import AppLayout from '../components/AppLayout'
import ClientDashboard from '../views/client/ClientDashboard'
import ClientSubscription from '../views/client/ClientSubscription'
import ClientPayments from '../views/client/ClientPayments'
import ClientProfile from '../views/client/ClientProfile'

export default function ClientRoutes() {
  return (
    <>
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
    </>
  )
}
