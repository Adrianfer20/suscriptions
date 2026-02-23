import React from 'react'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default function StatusBadge({ status }: { status?: string }) {
  const getStatusColor = (s?: string) => {
    switch (s) {
      case 'active':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      case 'inactive':
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
      case 'past_due':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
      case 'cancelled':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getLabel = (s?: string) => {
    switch (s) {
      case 'active':
        return 'Activo'
      case 'inactive':
        return 'Inactivo'
      case 'past_due':
        return 'Pendiente de pago'
      case 'cancelled':
        return 'Cancelado'
      default:
        return s || '-'
    }
  }

  const icon =
    status === 'active' ? (
      <CheckCircle className="w-3 h-3" />
    ) : status === 'past_due' ? (
      <AlertCircle className="w-3 h-3" />
    ) : (
      <Clock className="w-3 h-3" />
    )

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {icon}
      {getLabel(status)}
    </span>
  )
}
