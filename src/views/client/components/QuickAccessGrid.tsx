import React from 'react'
import { CreditCard, Receipt, User } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { useNavigate } from 'react-router-dom'

export default function QuickAccessGrid() {
  const navigate = useNavigate()

  return (
    <div>
      <h3 className="font-semibold text-gray-900 dark:text-secondary mb-4">Accesos rápidos</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-2 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
          onClick={() => navigate('/client/subscription')}
        >
          <CreditCard className="w-6 h-6" />
          <span>Mi Suscripción</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-2 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
          onClick={() => navigate('/client/payments')}
        >
          <Receipt className="w-6 h-6" />
          <span>Mis Pagos</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-2 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
          onClick={() => navigate('/client/profile')}
        >
          <User className="w-6 h-6" />
          <span>Mi Perfil</span>
        </Button>
      </div>
    </div>
  )
}
