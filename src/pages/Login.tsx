import React, { useState } from 'react'
import { useAuth } from '../auth'
import Button from '../components/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      alert('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="mb-8 text-center flex flex-col items-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">A
            <span className='text-secondary'>|</span>
            R SYSTEM</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Ingresa tus credenciales para acceder</p>
        </div>
        
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50">
          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-5">
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email" 
                    className="block w-full pl-10 h-12 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    placeholder="ejemplo@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="flex justify-between items-center mb-1.5 ml-1">
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                     Contraseña
                   </label>
                   <a href="#" className="text-xs font-medium text-primary hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300" tabIndex={-1}>
                    ¿Olvidaste tu contraseña?
                   </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="block w-full pl-10 pr-10 h-12 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98] rounded-lg bg-primary hover:bg-primary-600 text-white border-0" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Iniciando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Iniciar Sesión
                </span>
              )}
            </Button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} A|R System. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
