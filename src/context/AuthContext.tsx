import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { getAuthInstance } from '../services/firebase'
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth'

type User = { id?: string; email?: string; role?: string; displayName?: string; photoURL?: string } | null

type AuthContextType = {
  user: User
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const auth = getAuthInstance()
    if (!auth) {
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null)
        setToken(null)
        setLoading(false)
        return
      }

      try {
        const idToken = await fbUser.getIdToken()
        setToken(idToken)

        // Prefer custom claims first
        try {
          const tokenRes = await fbUser.getIdTokenResult()
          const roleFromClaims = (tokenRes.claims as any)?.role
          if (roleFromClaims) {
            setUser({ id: fbUser.uid, email: fbUser.email ?? undefined, role: roleFromClaims, displayName: fbUser.displayName ?? undefined, photoURL: fbUser.photoURL ?? undefined })
            setLoading(false)
            return
          }
        } catch (e) {
          // ignore
        }

        // Fallback to /auth/me on backend
        try {
          const res = await api.get('/auth/me')
          const me = res.data || {}
          setUser({ id: me.id ?? fbUser.uid, email: me.email ?? fbUser.email ?? undefined, role: me.role, displayName: me.displayName ?? fbUser.displayName ?? undefined, photoURL: fbUser.photoURL ?? undefined })
        } catch (e) {
          setUser({ id: fbUser.uid, email: fbUser.email ?? undefined, displayName: fbUser.displayName ?? undefined, photoURL: fbUser.photoURL ?? undefined })
        }
      } catch (e) {
        setUser({ id: fbUser.uid, email: fbUser.email ?? undefined, displayName: fbUser.displayName ?? undefined, photoURL: fbUser.photoURL ?? undefined })
      } finally {
        setLoading(false)
      }
    })

    return () => unsub()
  }, [])

  async function login(email: string, password: string) {
    const auth = getAuthInstance()
    if (!auth) throw new Error('Firebase auth not initialized')

    const cred = await signInWithEmailAndPassword(auth, email, password)
    const fbUser: FirebaseUser = cred.user
    const idToken = await fbUser.getIdToken()
    setToken(idToken)

    // Try custom claims
    try {
      const tokenRes = await fbUser.getIdTokenResult()
      const roleFromClaims = (tokenRes.claims as any)?.role
      if (roleFromClaims) {
        setUser({ id: fbUser.uid, email: fbUser.email ?? undefined, role: roleFromClaims, photoURL: fbUser.photoURL ?? undefined, displayName: fbUser.displayName ?? undefined })
        if (roleFromClaims === 'admin') navigate('/admin')
        else if (roleFromClaims === 'client') navigate('/client')
        else navigate('/')
        return
      }
    } catch (e) {
      // ignore
    }

    // Fallback to backend /auth/me
    try {
      const res = await api.get('/auth/me')
      const me = res.data || {}
      const role = me.role ?? undefined
      setUser({ id: me.id ?? fbUser.uid, email: me.email ?? fbUser.email ?? undefined, role, photoURL: fbUser.photoURL ?? undefined, displayName: me.displayName ?? fbUser.displayName ?? undefined })
      if (role === 'admin') navigate('/admin')
      else if (role === 'client') navigate('/client')
      else navigate('/')
      return
    } catch (e) {
      setUser({ id: fbUser.uid, email: fbUser.email?? undefined, photoURL: fbUser.photoURL ?? undefined, displayName: fbUser.displayName ?? undefined })
      navigate('/')
    }
  }

  function logout() {
    const auth = getAuthInstance()
    try {
      if (auth) signOut(auth)
    } catch (e) {
      // ignore
    }
    setToken(null)
    setUser(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
