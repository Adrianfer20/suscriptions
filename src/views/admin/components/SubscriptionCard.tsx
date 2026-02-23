import React from 'react'
import { CreditCard, Copy, CheckCircle } from 'lucide-react'
import { Subscription, Client } from '../../../services/api'

type Props = {
  sub: Subscription & { clientEmail?: string }
  client?: Client
  onEdit: (s: any) => void
  onDelete: (id: string) => void
  copiedValue: string | null
  onCopy: (text: string) => void
}

export default function SubscriptionCard({ sub, client, onEdit, onDelete, copiedValue, onCopy }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm space-y-3 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 opacity-5 dark:opacity-10 dark:text-white">
        <CreditCard size={64} />
      </div>

      <div>
        <div className="text-sm font-bold text-gray-900 dark:text-white pr-8">{client?.name || 'Cliente desconocido'}</div>
        <div className="flex flex-col gap-1 mt-1">
          {sub.clientEmail && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="truncate max-w-50">{sub.clientEmail}</span>
              <button onClick={() => onCopy(sub.clientEmail!)} className="hover:text-primary transition-colors p-1" title="Copiar email">
                {copiedValue === sub.clientEmail ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} />}
              </button>
            </div>
          )}

          {sub.passwordSub && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-700/80 px-1.5 py-0.5 rounded border border-gray-200 dark:border-slate-600 select-all">
                {sub.passwordSub}
              </span>
              <button onClick={() => onCopy(sub.passwordSub!)} className="text-gray-400 hover:text-primary dark:text-gray-500 dark:hover:text-primary transition-colors p-1" title="Copiar contraseña">
                {copiedValue === sub.passwordSub ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} />}
              </button>
            </div>
          )}

          {sub.country && (
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-300 mt-1">
              <span>País:</span>
              <span className="font-semibold">{sub.country}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-end border-t border-b border-gray-50 dark:border-slate-700/50 py-2">
        <div>
          <div className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider mb-0.5">Plan</div>
          <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">{sub.plan}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-lg border border-green-100 dark:border-green-900/30">
            {sub.amount}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="bg-gray-50 dark:bg-slate-700/50 p-2 rounded">
          <span className="block text-gray-400 dark:text-gray-500 font-semibold uppercase text-[10px]">Inicio</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{sub.startDate}</span>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded">
          <span className="block text-indigo-300 dark:text-indigo-400 font-semibold uppercase text-[10px]">Corte</span>
          <span className="font-medium text-indigo-900 dark:text-indigo-300">{sub.cutDate}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button 
          onClick={() => onEdit(sub)}
          className="flex-1 flex items-center justify-center gap-2 text-primary dark:text-white bg-primary/10 dark:bg-primary/50 hover:bg-primary/10 dark:hover:bg-primary/30 py-2 rounded-lg text-xs font-medium transition-colors border border-primary/10 dark:border-primary/20 cursor-pointer"
        >
          Editar
        </button>
        <button 
          onClick={() => onDelete(sub.id ?? sub.clientId)}
          className="flex-1 flex items-center justify-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40 py-2 rounded-lg text-xs font-medium transition-colors border border-red-100 dark:border-red-900/30 cursor-pointer"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}
