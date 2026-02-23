  // Calcula días restantes para el próximo cobro
  const getDaysUntilCut = (cutDate?: string) => {
    if (!cutDate) return '-';
    const today = new Date();
    const [year, month, day] = cutDate.split('-').map(Number);
    const cut = new Date(year, month - 1, day);
    const diff = cut.getTime() - today.setHours(0,0,0,0);
    if (isNaN(diff)) return '-';
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };
import React, { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { CreditCard, Receipt, User, Calendar, CheckCircle, AlertCircle, Clock, Loader2, UserCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api, { Subscription, Client, User as AuthUser } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

interface SubscriptionWithClient extends Subscription {
  clientName?: string
  clientEmail?: string
}

export default function ClientDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<SubscriptionWithClient | null>(null)
  const [clientData, setClientData] = useState<Client | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    
    const fetchData = async () => {
      if (!user?.id) {
        if (mounted) {
          setError('No se encontró el usuario')
          setLoading(false)
        }
        return
      }

      try {
        setLoading(true)
        
        // 1. Obtener datos del cliente desde /auth/me
        const authRes = await api.get('/auth/me')
        const authData = authRes.data?.data || authRes.data
        const userUid = user.id // UID de Firebase Auth

        // 2. Obtener cliente desde /clients usando el uid
        try {
          const clientRes = await api.get(`/clients/${userUid}`)
          const client = clientRes.data?.data || clientRes.data
          if (mounted) setClientData(client)
        } catch (e) {
          // El cliente puede no existir en Firestore si solo tiene usuario en Auth
          console.log('Cliente no encontrado en Firestore')
        }
        
        if (!mounted) return
        
        // 3. Obtener suscripciones y filtrar por clientId (uid)
        const subsRes = await api.get('/subscriptions')
        const subscriptions = subsRes.data?.data || subsRes.data || []
        
        // Filtrar suscripciones donde clientId === userUid
        const userSubscriptions = (subscriptions as Subscription[]).filter(
          (sub: Subscription) => sub.clientId === userUid
        )
        
        // Buscar suscripción activa
        const active = userSubscriptions.find((sub: Subscription) => sub.status === 'active')
        
        if (active) {
          setSubscription({
            ...active,
            clientName: authData?.displayName || '',
            clientEmail: authData?.email || ''
          })
        } else {
          setSubscription(null)
        }
      } catch (err: any) {
        console.error('Error fetching data:', err)
        if (mounted) setError('No se pudieron cargar los datos')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()
    
    return () => {
      mounted = false
    }
  }, [user])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    // Mostrar la fecha tal cual, pero con formato legible
    // dateStr es 'YYYY-MM-DD'
    const [year, month, day] = dateStr.split('-');
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const mesNombre = meses[parseInt(month, 10) - 1] || '';
    return `${parseInt(day, 10)} de ${mesNombre} de ${year}`;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-secondary tracking-tight">Dashboard Cliente</h2>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Bienvenido{user?.displayName ? `, ${user.displayName}` : ''}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-600 dark:text-yellow-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tu Plan Actual */}
        <Card className="border-l-4 border-l-primary/70">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-secondary">Tu Plan Actual</h3>
            {subscription?.status && (
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                {subscription.status === 'active' ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                {subscription.status === 'active' ? 'Activo' : subscription.status}
              </span>
            )}
          </div>
          
          {subscription ? (
            <>
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
                  <Calendar className="w-4 h-4" />
                  Próximo corte:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-200">{formatDate(subscription.cutDate)}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-primary dark:text-secondary font-semibold">
                {typeof getDaysUntilCut(subscription.cutDate) === 'number' && getDaysUntilCut(subscription.cutDate) >= 0 ? (
                  <>
                    <Clock className="w-4 h-4" />
                    Faltan {getDaysUntilCut(subscription.cutDate)} días para el cobro
                  </>
                ) : (
                  <span>No se pudo calcular los días restantes</span>
                )}
              </div>
              <div className="mt-3">
                <Button 
                  variant="primary" 
                  className="w-full font-bold shadow-md shadow-primary/20"
                  onClick={() => navigate('/client/subscription')}
                >
                  Ver detalles
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No tienes suscripción activa</p>
              <Button variant="secondary" size="sm" className="mt-3">
                Contactar soporte
              </Button>
            </div>
          )}
        </Card>

        {/* Información del Cliente */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-secondary">Tu Información</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/client/profile')}
              className="text-primary hover:text-primary/80"
            >
              Editar <User className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
              <UserCircle className="w-8 h-8 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Nombre</div>
                <div className="font-medium text-gray-900 dark:text-gray-200">
                  {user?.displayName || clientData?.name || 'No definido'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
              <UserCircle className="w-8 h-8 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                <div className="font-medium text-gray-900 dark:text-gray-200">
                  {user?.email || 'No definido'}
                </div>
              </div>
            </div>
            {clientData?.phone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                <UserCircle className="w-8 h-8 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Teléfono</div>
                  <div className="font-medium text-gray-900 dark:text-gray-200">
                    {clientData.phone}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Acceso rápido */}
      <Card>
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
      </Card>
    </div>
  )
}
