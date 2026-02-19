import React from 'react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Client } from '../../../api'

type FormShape = {
  clientId: string
  startDate?: string
  cutDate?: string
  amount?: string
  status?: string
  plan?: string
  passwordSub?: string
  country?: string
}

type Props = {
  form: FormShape
  setForm: (f: FormShape) => void
  clients: Client[]
  onCancel: () => void
  onSubmit: (e: React.FormEvent) => void
  creating: boolean
  editingId: string | null
}

export default function SubscriptionForm({ form, setForm, clients, onCancel, onSubmit, creating, editingId }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden transition-all duration-300 ease-in-out">
      <div className="p-6 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editingId ? "Editar Suscripción" : "Registrar Nueva Suscripción"}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configura los detalles del plan para el cliente seleccionado.</p>
      </div>
      <div className="p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 block">Cliente</label>
              <select 
                className="flex h-11 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                value={form.clientId} 
                onChange={(e) => setForm({ ...form, clientId: e.target.value })} 
                required
                disabled={!!editingId}
              >
                <option value="">Selecciona un cliente</option>
                {clients.map((c) => {
                  const val = c.uid || c.id || ''
                  const label = c.name || c.email || val
                  return (
                    <option key={val} value={val}>
                      {label} {c.email ? `(${c.email})` : ''}
                    </option>
                  )
                })}
              </select>
            </div>

            <div>
              <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 block">Plan</label>
              <select 
                className="flex h-11 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                value={form.plan} 
                onChange={(e) => setForm({ ...form, plan: e.target.value })} 
                required
              >
                <option value="">Selecciona un plan</option>
                <option value="Itinerante Ilimitado">Itinerante Ilimitado</option>
                <option value="Itinerante Limitado">Itinerante Limitado</option>
              </select>
            </div>

            <div>
              <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 block">País</label>
              <select
                className="flex h-11 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                value={form.country || ''}
                onChange={e => setForm({ ...form, country: e.target.value })}
                required
              >
                <option value="">Selecciona país</option>
                <option value="BR">Brasil</option>
                <option value="VES">Venezuela</option>
                <option value="COL">Colombia</option>
                <option value="AR">Argentina</option>
              </select>
            </div>

            <Input 
              label="Contraseña del Servicio" 
              value={form.passwordSub || ''} 
              onChange={(e) => setForm({ ...form, passwordSub: e.target.value })} 
              placeholder="Contraseña del servicio"
              required={!editingId}
            />

            <Input 
              label="Monto ($)" 
              value={form.amount} 
              onChange={(e) => setForm({ ...form, amount: e.target.value })} 
              placeholder="$50.000"
              required
            />

            <Input 
              label="Fecha de Inicio" 
              type="date"
              value={form.startDate} 
              onChange={(e) => setForm({ ...form, startDate: e.target.value })} 
              required
            />
            
            <Input 
              label="Fecha de Corte" 
              type="date"
              value={form.cutDate} 
              onChange={(e) => setForm({ ...form, cutDate: e.target.value })} 
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={creating}>
              Cancelar
            </Button>
            <Button type="submit" disabled={creating} className="min-w-30">
              {creating ? 'Procesando...' : (editingId ? 'Actualizar' : 'Crear Suscripción')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
