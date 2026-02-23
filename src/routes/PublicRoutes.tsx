import Login from '../pages/Login'
import { Route } from 'react-router-dom'

export default function PublicRoutes() {
  return (
    <>
      <Route path="/login" element={<Login />} />
    </>
  )
}
