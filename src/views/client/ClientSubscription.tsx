import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { CreditCard, Calendar, AlertCircle, CheckCircle, Clock, Loader2, KeyRound } from 'lucide-react'
import api, { Subscription } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

interface SubscriptionWithDetails extends Subscription {
  clientName?: string
  clientEmail?: string
}

export default function ClientSubscription() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<SubscriptionWithDetails | null>(null)
  const [allSubscriptions, setAllSubscriptions] = useState<SubscriptionWithDetails[]>([])
  const [error, setError] = useState<string | null>(null)
  const [renewing, setRenewing] = useState(false)

  useEffect(() => {
    let mounted = true
    
    const fetchSubscription = async () => {
      if (!user?.id) {
        if (mounted) {
          setError('No se encontró el usuario')
          setLoading(false)
        }
        return
      }

      try {
        setLoading(true)
        
        // Obtener suscripciones
        const res = await api.get('/subscriptions')
        const subscriptions = res.data?.data || res.data || []
        const userUid = user.id
        
        // Filtrar suscripciones donde clientId === user.id
        const userSubscriptions = (subscriptions as Subscription[])
          .filter((sub: Subscription) => sub.clientId === userUid)
          .map((sub: Subscription) => ({
            ...sub,
            clientName: user.displayName || '',
            clientEmail: user.email || ''
          }))
        
        if (!mounted) return
        
        setAllSubscriptions(userSubscriptions)
        
        // Buscar suscripción activa
        const active = userSubscriptions.find((sub) => sub.status === 'active')
        setSubscription(active || null)
        
        } catch (err: any) {
        console.error('Error fetching subscription:', err)
        if (mounted) setError('No se pudo cargar la información de tu suscripción')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchSubscription()
    
    return () => {
      mounted = false
    }
  }, [user])

  useEffect(() => {
    if (error) {
      toast.error(error)
      setError(null)
    }
  }, [error])

  const handleRenew = async () => {
    if (!subscription?.id) return
    
    try {
      setRenewing(true)
      await api.post(`/subscriptions/${subscription.id}/renew`)
      
      // Recargar datos
      window.location.reload()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al renovar suscripción')
    } finally {
      setRenewing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      case 'about_to_expire':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
      case 'suspended':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
      case 'paused':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
      case 'cancelled':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'about_to_expire':
        return 'Por Vencer'
      case 'suspended':
        return 'Suspendido'
      case 'paused':
        return 'Pausado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-secondary tracking-tight">Mi Suscripción</h2>
        <p className="text-sm text-gray-500 dark:text-gray-300">Gestiona tu plan de suscripción</p>
      </div>

      {/* Errors are shown via toast notifications */}

      {!subscription && !error && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tienes suscripción activa</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">Contacta con nosotros para contratar un plan</p>
            <Button>
              Contactar soporte
            </Button>
          </div>
        </Card>
      )}

      {subscription && (
        <>
          {/* Estado de la suscripción */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getStatusColor(subscription.status || '')}`}> 
            {subscription.status === 'active' ? (
              <CheckCircle className="w-4 h-4" />
            ) : subscription.status === 'about_to_expire' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{getStatusLabel(subscription.status || '')}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan Actual */}
            <Card className="border-l-4 border-l-primary/70">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Plan</h3>
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-bold text-xl text-gray-900 dark:text-gray-200">{subscription.plan}</div>
                  <div className="text-3xl font-bold text-primary dark:text-secondary mt-2">{subscription.amount}<span className="text-sm font-normal text-gray-500 dark:text-gray-300">/mes</span></div>
                  {subscription.country && (
                    <div className="mt-2 text-sm text-blue-600 dark:text-blue-300 font-semibold">País: {subscription.country}</div>
                  )}
                </div>
                <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600" />
              </div>
              {/* Contraseña del servicio */}
              {subscription.passwordSub && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <KeyRound className="w-4 h-4" />
                    Contraseña del servicio
                  </div>
                  <div className="font-mono text-sm bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded-lg text-gray-900 dark:text-gray-200">
                    {subscription.passwordSub}
                  </div>
                </div>
              )}
            </Card>

            {/* Fechas */}
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Información de Facturación</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Fecha de inicio</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-200">{formatDate(subscription.startDate)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Próximo corte</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-200">{formatDate(subscription.cutDate)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Acciones */}
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Opciones</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="primary"
                onClick={handleRenew}
                disabled={renewing}
              >
                {renewing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Renovando...
                  </>
                ) : (
                  'Renovar suscripción'
                )}
              </Button>
              <Button variant="secondary">
                Solicitar cambio de plan
              </Button>
              <Button variant="outline">
                Ver historial
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Historial de suscripciones */}
      {allSubscriptions.length > 1 && (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Historial de Planes</h3>
          <div className="space-y-3">
            {allSubscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-200">{sub.plan}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(sub.startDate)} - {sub.status === 'active' ? 'Actual' : formatDate(sub.cutDate)}
                  </div>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(sub.status || '')}`}>
                  {getStatusLabel(sub.status || '')}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
