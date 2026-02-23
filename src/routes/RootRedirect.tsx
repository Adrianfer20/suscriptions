import { Navigate } from 'react-router-dom'

export default function RootRedirect({ user }: { user: any }) {
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'admin' ? '/admin' : '/client'} replace />
}
