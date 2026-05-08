import { Suspense } from 'react'
import { Route } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import LoadingSpinner from '../components/LoadingSpinner'
import React from 'react'

const AppLayout = React.lazy(() => import('../components/AppLayout'))
const AdminDashboard = React.lazy(() => import('../views/admin/AdminDashboard'))
const AdminClients = React.lazy(() => import('../views/admin/AdminClients'))
const AdminSubscriptions = React.lazy(() => import('../views/admin/AdminSubscriptions'))
const AdminClientEdit = React.lazy(() => import('../views/admin/AdminClientEdit'))
const AdminCommunication = React.lazy(() => import('../views/admin/AdminCommunication'))
const AdminAutomation = React.lazy(() => import('../views/admin/AdminAutomation'))
const AdminProfile = React.lazy(() => import('../views/admin/AdminProfile'))
const AdminUsers = React.lazy(() => import('../views/admin/AdminUsers'))
const AdminPayments = React.lazy(() => import('../views/admin/AdminPayments'))

const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
)

export default function AdminRoutes() {
  return (
    <>
      <Route path="/admin" element={
        <ProtectedRoute roles={["admin"]}>
          <Lazy><AppLayout /></Lazy>
        </ProtectedRoute>
      }>
        <Route index element={<Lazy><AdminDashboard /></Lazy>} />
        <Route path="clients" element={<Lazy><AdminClients /></Lazy>} />
        <Route path="client/:uid" element={<Lazy><AdminClientEdit /></Lazy>} />
        <Route path="subscriptions" element={<Lazy><AdminSubscriptions /></Lazy>} />
        <Route path="communication" element={<Lazy><AdminCommunication /></Lazy>} />
        <Route path="automation" element={<Lazy><AdminAutomation /></Lazy>} />
        <Route path="users" element={<Lazy><AdminUsers /></Lazy>} />
        <Route path="payments" element={<Lazy><AdminPayments /></Lazy>} />
        <Route path="me" element={<Lazy><AdminProfile /></Lazy>} />
      </Route>
    </>
  )
}
