import { getDaysUntilCut } from '../../utils/date'
import { useEffect } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import useClientDashboard from '../../hooks/useClientDashboard'
import { useAuth } from '../../context/AuthContext'
import type { Subscription } from '../../services/api'
import PlanCard from './components/PlanCard'
import QuickAccessGrid from './components/QuickAccessGrid'

export default function ClientDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { loading, subscription, error, clearError } = useClientDashboard(user?.id)

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])


  if (loading) return <LoadingSpinner message="Cargando..." />
  

  const daysUntil = subscription ? getDaysUntilCut(subscription.cutDate) : '-'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Cliente"
        subtitle={
          user?.displayName ? `Bienvenido, ${user.displayName}` : "Bienvenido"
        }
      />

      <PlanCard subscription={subscription as Subscription | null} daysUntil={daysUntil} onDetails={() => navigate('/client/subscription')} />

        <Card>
          <QuickAccessGrid />
        </Card>
    </div>
  );
}
