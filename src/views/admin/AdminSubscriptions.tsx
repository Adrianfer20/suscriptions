import React, { useEffect, useState } from 'react'
import { Plus, ChevronDown, ChevronUp, CreditCard, Copy, Pencil, Trash2, CheckCircle } from 'lucide-react'
import { subscriptionsApi, clientsApi, authApi, Subscription, Client } from '../../api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import SubscriptionCard from './components/SubscriptionCard'
import SubscriptionForm from './components/SubscriptionForm'

type SubscriptionWithEmail = Subscription & { clientEmail?: string }

type SubscriptionForm = {
  clientId: string
  startDate?: string
  cutDate?: string
  amount?: string
  status?: string
  plan?: string
  passwordSub?: string
  country?: string
}

export default function AdminSubscriptions() {
  const [items, setItems] = useState<SubscriptionWithEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<SubscriptionForm>({ clientId: '', startDate: '', cutDate: '', amount: '', plan: '', passwordSub: '' })
  const [clients, setClients] = useState<Client[]>([])
  const [copiedValue, setCopiedValue] = useState<string | null>(null)

  const PLAN_LABELS: Record<string, string> = {
    'Itinerante Ilimitado': 'Itinerante Ilimitado',
    'Itinerante Limitado': 'Itinerante Limitado',
    'starlink-basic': 'Itinerante Ilimitado', // Fallback for old records
    'starlink-limited': 'Itinerante Limitado'  // Fallback for old records
  }

  const today = new Date().toISOString().slice(0, 10)

  // ensure form defaults dates to today
  useEffect(() => {
    setForm((f) => ({ ...f, startDate: f.startDate || today, cutDate: f.cutDate || today }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let mounted = true
    setLoading(true)

    const fetchSubs = async () => {
      try {
        const res = await subscriptionsApi.list()
        if (!mounted) return
        
        const list = (Array.isArray(res.data) ? res.data : (res.data?.data || [])) as Subscription[]

        // Enrich with client email
        const enriched = await Promise.all(list.map(async (s: Subscription) => {
            const clientId = s.clientId
            if (!clientId) return s
            try {
              // Try getting user info from auth
              const r = await authApi.getUser(clientId)
              // @ts-ignore
              const user = r.data?.data || r.data?.user || r.data
              return { ...s, clientEmail: user?.email }
            } catch (e) {
              return s
            }
          })
        )
        if (mounted) setItems(enriched)
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    
    fetchSubs()

    return () => {
      mounted = false
    }
  }, [])

  // load clients for select
  useEffect(() => {
    let mounted = true
    const fetchClients = async () => {
      try {
        const res = await clientsApi.list()
        if (!mounted) return
        const list = (Array.isArray(res.data) ? res.data : (res.data?.data || [])) as Client[]
        setClients(list)
      } catch (e) {
        // error
      }
    }
    fetchClients()
    return () => {
      mounted = false
    }
  }, [])

  function handleEdit(item: SubscriptionWithEmail) {
    setIsFormOpen(true)
    setEditingId(item.id ?? null)
    setForm({
      clientId: item.clientId,
      plan: item.plan,
      amount: item.amount,
      startDate: item.startDate,
      cutDate: item.cutDate,
      country: item.country || '',
      passwordSub: item.passwordSub || ''
    })
  }

  function handleCancelEdit() {
    setIsFormOpen(false)
    setEditingId(null)
    setForm({ clientId: '', startDate: today, cutDate: today, amount: '', plan: '', passwordSub: '' })
  }

  async function handleCreate(e: React.FormEvent) {

    e.preventDefault()
    setCreating(true)
    try {
      if (!form.clientId) throw new Error('Cliente es requerido')
      if (!form.plan) throw new Error('Plan es requerido')
      if (!form.startDate) throw new Error('Fecha de inicio es requerida')
      if (!form.cutDate) throw new Error('Fecha de corte es requerida')
      if (!form.amount) throw new Error('Monto es requerido')
      if (!editingId && !form.passwordSub) throw new Error('Contraseña del servicio es requerida')
      
      const formatDate = (d?: string) => {
        if (!d) return undefined
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d
        const parsed = new Date(d)
        // @ts-ignore
        if (isNaN(parsed)) return d
        return parsed.toISOString().slice(0, 10)
      }

      const normalizeAmount = (a?: string) => {
        if (!a) return ''
        const trimmed = a.trim()
        if (/^\$/.test(trimmed)) return trimmed
        return `$${trimmed}`
      }

      const commonPayload: any = {
        plan: form.plan || '',
        startDate: formatDate(form.startDate) ?? form.startDate ?? '',
        cutDate: formatDate(form.cutDate) ?? form.cutDate ?? '',
        amount: normalizeAmount(form.amount),
        country: form.country || ''
      }
      
      if (form.passwordSub) {
        commonPayload.passwordSub = form.passwordSub
      }

      if (editingId) {
        const res = await subscriptionsApi.update(editingId, commonPayload)
        // Update local list
        setItems((prev) => 
          prev.map((s) => s.id === editingId ? { ...s, ...commonPayload, id: editingId } : s)
        )
        // Reset
        handleCancelEdit()
      } else {
        const createPayload = { ...commonPayload, clientId: form.clientId }
        const res = await subscriptionsApi.create(createPayload as Subscription)
        let created = (res.data?.data || res.data) as SubscriptionWithEmail
        
        if (created?.clientId) {
          try {
            const r = await authApi.getUser(created.clientId)
            // @ts-ignore
            const user = r.data?.data || r.data?.user || r.data
            created = { ...created, clientEmail: user?.email ?? undefined }
          } catch (e) {
            // ignore
          }
        }
        setItems((s) => [created, ...s])
        setForm({ clientId: '', startDate: today, cutDate: today, amount: '', plan: '', passwordSub: '' })
        setIsFormOpen(false)
      }

    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error
      const msg = serverMsg || (err instanceof Error ? err.message : 'Error procesando solicitud')
      alert(msg)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta suscripción permanentemente?')) return
    try {
      await subscriptionsApi.delete(id)
      setItems((prev) => prev.filter((s) => s.id !== id))
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error
      const msg = serverMsg || (err instanceof Error ? err.message : 'Error eliminando suscripción')
      alert(msg)
    }
  }

  const handleCopy = (text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedValue(text)
    setTimeout(() => setCopiedValue(null), 2000)
  }

  return (
    <div className="space-y-6">
      {copiedValue && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
           <CheckCircle size={16} className="text-green-500" />
           Copiado al portapapeles
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Suscripciones</h2>
           <p className="text-sm text-gray-500 dark:text-gray-400">Gestiona los planes y cobros de los clientes</p>
        </div>
        <Button 
          onClick={() => {
              if (isFormOpen && editingId) handleCancelEdit();
              else setIsFormOpen(!isFormOpen);
          }}
          className="flex items-center gap-2"
          variant={isFormOpen ? "outline" : "primary"}
        >
          {isFormOpen ? <ChevronUp size={18} /> : <Plus size={18} />}
          {isFormOpen ? (editingId ? 'Cancelar Edición' : 'Cancelar') : 'Nueva Suscripción'}
        </Button>
      </div>

      {isFormOpen && (
        <SubscriptionForm
          form={form}
          setForm={setForm}
          clients={clients}
          onCancel={handleCancelEdit}
          onSubmit={handleCreate}
          creating={creating}
          editingId={editingId}
        />
      )}

      {/* Lista */}
      <Card title={`Historial de Suscripciones (${items.length})`} className="h-full">
        {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
         ) : items.length === 0 ? (
            <div className="text-center p-12">
               <div className="bg-gray-100 dark:bg-slate-700/50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                 <CreditCard size={32} className="text-gray-400 dark:text-gray-500" />
               </div>
               <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay suscripciones activas</h3>
               <p className="text-gray-500 dark:text-gray-400 mb-6">Crea una nueva suscripción para comenzar.</p>
               <Button onClick={() => setIsFormOpen(true)}>
                 Crear primera suscripción
               </Button>
            </div>
         ) : (
            <div className="-mx-4 sm:mx-0 overflow-x-hidden">
              {/* Mobile View (Cards) */}
              <div className="sm:hidden space-y-4 px-4 pb-4">
                {items.map((sub: any) => (
                  <SubscriptionCard
                    key={sub.id ?? sub.clientId}
                    sub={sub}
                    client={clients.find(c => c.uid === sub.clientId || c.id === sub.clientId)}
                    onEdit={handleEdit}
                    onDelete={(id) => handleDelete(id)}
                    copiedValue={copiedValue}
                    onCopy={handleCopy}
                  />
                ))}
              </div>

              {/* Desktop View (Table) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50/50 dark:bg-slate-900/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan / Monto</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">País</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fechas</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {items.map((sub: any) => (
                      <tr key={sub.id ?? sub.clientId} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold px-1.5 text-gray-900 dark:text-white mb-1">
                            {clients.find(c => (c.uid === sub.clientId || c.id === sub.clientId))?.name || 'Cliente desconocido'}
                          </div>
                          <div className="flex flex-col gap-1">
                              {sub.clientEmail && (
                                <div className="flex items-center justify-around gap-2 group bg-slate-100 dark:bg-slate-700/80 px-1.5 py-0.5 rounded border border-gray-200 dark:border-slate-600">
                                   <span className="text-xs text-gray-700 dark:text-slate-400">{sub.clientEmail}</span>
                                   <button onClick={() => handleCopy(sub.clientEmail!)} className="text-gray-900 hover:text-primary dark:text-slate-500 dark:hover:text-primary transition-all p-0.5 cursor-pointer" title="Copiar email">
                                   {copiedValue === sub.clientEmail ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} />}
                                   </button>
                                </div>
                              )}
                              {sub.passwordSub && (
                                <div className="flex items-center justify-around gap-2 mt-0.5 group bg-slate-100 dark:bg-slate-700/80 px-1.5 py-0.5 rounded border border-gray-200 dark:border-slate-600">
                                   <span className="text-xs font-mono font-medium px-1.5 py-0.5 rounded text-gray-700 dark:text-slate-400 dark:border-slate-600 select-all">
                                     {sub.passwordSub}
                                   </span>
                                   <button onClick={() => handleCopy(sub.passwordSub!)} className=" text-gray-900 hover:text-primary dark:text-slate-500 dark:hover:text-primary transition-all p-0.5 cursor-pointer" title="Copiar contraseña">
                                     {copiedValue === sub.passwordSub ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} />}
                                   </button>
                                </div>
                              )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-300 font-medium">{PLAN_LABELS[sub.plan] || sub.plan}</div>
                          <div className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full inline-block mt-1 font-medium border border-green-100 dark:border-green-900/30">
                             {sub.amount}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">{sub.country || '-'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                              <div><span className="font-medium text-gray-700 dark:text-gray-300">Inicio:</span> {sub.startDate}</div>
                              <div><span className="font-medium text-gray-700 dark:text-gray-300">Corte:</span> {sub.cutDate}</div>
                           </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEdit(sub)}
                              className="text-primary hover:text-primary-700 dark:text-slate-400 dark:hover:text-slate-300 font-medium text-xs bg-primary/10 dark:bg-primary/50 p-2 rounded-md hover:bg-primary/20 dark:hover:bg-primary/60 transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(sub.id ?? sub.clientId)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium text-xs bg-red-50 dark:bg-red-900/30 p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* End of Desktop View */}
            </div>
         )}
      </Card>
    </div>
  )
}

