import React from 'react'
import { CreditCard, Clock } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import StatusBadge from '../../../components/ui/StatusBadge'
import { formatDate } from '../../../utils/date'
import type { Subscription } from '../../../services/api'

export default function PlanCard({
  subscription,
  daysUntil,
  onDetails,
}: {
  subscription: Subscription | null
  daysUntil: number | string
  onDetails: () => void
}) {
  if (!subscription) {
    return (
      <Card className="border-l-4 border-l-primary/70">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No tienes suscripción activa</p>
          <Button variant="secondary" size="sm" className="mt-3">
            Contactar soporte
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-l-4 border-l-primary/70">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-secondary">Tu Plan Actual</h3>
        <StatusBadge status={subscription.status} />
      </div>

      <div className="flex items-center justify-between py-2">
        <div>
          <div className="font-bold text-lg text-gray-900 dark:text-gray-200">{subscription.plan}</div>
          <div className="text-2xl font-bold text-primary mt-1 dark:text-secondary">
            {subscription.amount}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-300">/mes</span>
          </div>
        </div>
        <CreditCard className="w-10 h-10 text-gray-300 dark:text-gray-600" />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          Próximo corte:
        </span>
        <span className="font-medium text-gray-900 dark:text-gray-200">{formatDate(subscription.cutDate)}</span>
      </div>

      <div className="mt-2 flex items-center gap-2 text-sm text-primary dark:text-secondary font-semibold">
        {typeof daysUntil === 'number' && daysUntil >= 0 ? (
          <>
            <Clock className="w-4 h-4" />
            Faltan {daysUntil} días para el cobro
          </>
        ) : (
          <span>No se pudo calcular los días restantes</span>
        )}
      </div>

      <div className="mt-3">
        <Button variant="primary" className="w-full font-bold shadow-md shadow-primary/20" onClick={onDetails}>
          Ver detalles
        </Button>
      </div>
    </Card>
  )
}
