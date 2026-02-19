import React, { useEffect, useState } from 'react'
import { authApi, User } from '../../api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { UserCheck } from 'lucide-react'

export default function AdminProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ displayName: '', phone: '', address: '' })

  useEffect(() => {
    let mounted = true
    const fetchMe = async () => {
      try {
        const res = await authApi.me()
        // @ts-ignore: Accessing user property if nested differently
        const u = res.data?.user || res.data?.data 
        
        if (mounted && u) {
          setUser(u)
          setForm({ 
            // @ts-ignore: Check for 'name' property from backend
            displayName: u.name || u.displayName || '', 
            // @ts-ignore
            phone: u.phone || '', 
            // @ts-ignore
            address: u.address || '' 
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchMe()
    return () => { mounted = false }
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    // Aquí iría la lógica de actualización cuando el backend lo soporte
    // Por ahora simulamos
    setTimeout(() => {
        alert('Perfil actualizado (Simulado)')
        setSaving(false)
    }, 1000)
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando perfil...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-600 flex items-center justify-center text-xl font-bold text-primary dark:text-white shadow-sm overflow-hidden">
            {user?.email?.charAt(0).toUpperCase()}
        </div>
        <div>
            {/* @ts-ignore: Check for 'name' too */}
            <h2 className="text-2xl font-bold text-primary dark:text-white">{user?.displayName || user?.name || 'Usuario'}</h2>
            <p className="text-gray-500">{user?.email}</p>
        </div>
      </div>

      <Card title="Información Personal">
        <form onSubmit={handleUpdate} className="space-y-4">
            <Input 
                label="Nombre Completo"
                value={form.displayName}
                onChange={(e) => setForm({...form, displayName: e.target.value})}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                    label="Teléfono"
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    placeholder="+56 9 1234 5678"
                />
                <Input 
                    label="Dirección"
                    value={form.address}
                    onChange={(e) => setForm({...form, address: e.target.value})}
                    placeholder="Av. Principal 123"
                />
            </div>

            <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={saving} className="flex items-center gap-2">
                    <UserCheck size={18} />
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
      </Card>

      <Card title="Seguridad">
          <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 flex items-start gap-3">
                  <div className="text-yellow-600 mt-0.5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                      <h4 className="text-sm font-medium text-yellow-800">Cambiar Contraseña</h4>
                      <p className="text-xs text-yellow-700 mt-1">Para cambiar tu contraseña, por favor contacta al administrador del sistema o usa la opción de recuperación de contraseña en el login.</p>
                  </div>
              </div>
          </div>
      </Card>
    </div>
  )
}
