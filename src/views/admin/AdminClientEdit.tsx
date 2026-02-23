import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { clientsApi, authApi, Client } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export default function AdminClientEdit() {
  const { uid: clientId } = useParams() // The route param is :uid but we changed link to ID, let's assume it's ID now. Wait, route definition might say :uid
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [client, setClient] = useState<Client | null>(null)
  const [email, setEmail] = useState('')
  
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!clientId) return
    setLoading(true)
    
    const fetchData = async () => {
      try {
        // Fetch Client
        const res = await clientsApi.get(clientId)
        const payload = res.data
        const data = payload.data || (payload as any) // Backup in case it returns raw object

        if (!data || !data.name) {
             // If still looks invalid, maybe throw or handle
             // but 'as any' above handles the property access issue
        }

        const clientData = data as Client
        setClient(clientData)
        setForm({ 
          name: clientData.name || '', 
          phone: clientData.phone || '', 
          address: clientData.address || '' 
        })
        
        // Fetch User Email if uid exists
        if (clientData.uid) {
           try {
             const uRes = await authApi.getUser(clientData.uid)
             // @ts-ignore
             const uData = uRes.data?.data || uRes.data?.user || uRes.data
             setEmail(uData?.email || '')
           } catch {
             // ignore
           }
        }
      } catch (err) {
        console.error(err)
        setError('Error cargando cliente')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [clientId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId) return
    
    setSaving(true)
    setError(null)
    
    try {
      await clientsApi.update(clientId, form)
      alert('Cliente actualizado correctamente')
      navigate('/admin/clients')
    } catch (err: any) {
        console.error(err)
        const serverMsg = err.response?.data?.message || err.response?.data?.error
        const msg = serverMsg || (err instanceof Error ? err.message : 'Error actualizando cliente')
        setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando datos...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Editar Cliente</h2>
          <p className="text-sm text-gray-500">Actualiza la información de contacto</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/admin/clients')}>
          &larr; Volver
        </Button>
      </div>

      <Card title={`Editar: ${client?.name || clientId}`}>
        {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                {error}
            </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="ID Cliente"
            value={clientId || ''}
            disabled
            className="bg-gray-50 text-gray-500"
          />

          <Input
            label="Email (Asociado)"
            value={email || 'No disponible'}
            disabled
            className="bg-gray-50 text-gray-500"
          />

          <Input
            label="Nombre Completo"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ej: Juan Pérez"
            required
          />

          <Input
            label="Teléfono"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+56 9 1234 5678"
          />

          <Input
            label="Dirección"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Calle Falsa 123"
          />

          <div className="pt-4 flex justify-end gap-3">
             <Button type="button" variant="secondary" onClick={() => navigate('/admin/clients')}>
                Cancelar
             </Button>
             <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
             </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

