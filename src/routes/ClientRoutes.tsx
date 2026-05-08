import { Suspense } from 'react'
import { Route } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import LoadingSpinner from '../components/LoadingSpinner'
import React from 'react'

const AppLayout = React.lazy(() => import('../components/AppLayout'))
const ClientDashboard = React.lazy(() => import('../views/client/ClientDashboard'))
const ClientSubscription = React.lazy(() => import('../views/client/ClientSubscription'))
const ClientPayments = React.lazy(() => import('../views/client/ClientPayments'))
const ClientProfile = React.lazy(() => import('../views/client/ClientProfile'))

const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
)

export default function ClientRoutes() {
  return (
    <>
      <Route
        path="/client/*"
        element={
          <ProtectedRoute roles={["client"]}>
            <Lazy><AppLayout /></Lazy>
          </ProtectedRoute>
        }
      >
        <Route index element={<Lazy><ClientDashboard /></Lazy>} />
        <Route path="subscription" element={<Lazy><ClientSubscription /></Lazy>} />
        <Route path="payments" element={<Lazy><ClientPayments /></Lazy>} />
        <Route path="profile" element={<Lazy><ClientProfile /></Lazy>} />
      </Route>
    </>
  )
}
