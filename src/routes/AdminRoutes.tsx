import { Route } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import AppLayout from '../components/AppLayout'
import AdminDashboard from '../views/AdminDashboard'
import AdminClients from '../views/admin/AdminClients'
import AdminSubscriptions from '../views/admin/AdminSubscriptions'
import AdminClientEdit from '../views/admin/AdminClientEdit'
import AdminCommunication from '../views/admin/AdminCommunication'
import AdminAutomation from '../views/admin/AdminAutomation'
import AdminProfile from '../views/admin/AdminProfile'
import AdminUsers from '../views/admin/AdminUsers'
import AdminPayments from '../views/admin/AdminPayments'

export default function AdminRoutes() {
  return (
    <>
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
        <Route path="payments" element={<AdminPayments />} />
        <Route path="me" element={<AdminProfile />} />
      </Route>
    </>
  )
}
