import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth'

export function ProtectedRoute({ children, roles }: { children: JSX.Element; roles?: string[] }) {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (roles && roles.length > 0) {
    const role = user?.role
    if (!role || !roles.includes(role)) return <Navigate to="/" replace />
  }
  return children
}
