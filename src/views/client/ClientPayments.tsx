import React, { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Receipt, Download, Calendar, CheckCircle, Clock, XCircle, Loader2, AlertCircle } from 'lucide-react'
import api, { Subscription } from '../../api'
import { useAuth } from '../../auth'

interface PaymentRecord {
  id: string
  plan: string
  amount: string
  status: 'paid' | 'pending' | 'failed' | 'up_to_date'
  startDate: string
  cutDate: string
}

export default function ClientPayments() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    let mounted = true
    
    const fetchPayments = async () => {
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
        
        if (!mounted) return
        
        // Mapear suscripciones a registros de pago
        // Nueva lógica: 'al día' si faltan más de 3 días para el corte, 'pendiente' si faltan 3 días o menos, 'pagado' si el corte ya pasó
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const paymentRecords: PaymentRecord[] = userSubscriptions.map((sub: Subscription) => {
          const cutDate = sub.cutDate ? new Date(sub.cutDate) : null
          const isPast = cutDate && cutDate < today
          const isActive = sub.status === 'active'
          let status: 'paid' | 'pending' | 'failed' | 'up_to_date' = 'failed';
          if (isPast) {
            status = 'paid';
          } else if (isActive && cutDate) {
            // Calcular días hasta el corte
            const diffDays = Math.ceil((cutDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays > 3) {
              status = 'up_to_date'; // Al día
            } else {
              status = 'pending'; // Por vencer
            }
          } else if (!isActive) {
            status = 'failed';
          }
          return {
            id: sub.id || Math.random().toString(),
            plan: sub.plan,
            amount: sub.amount,
            status,
            startDate: sub.startDate,
            cutDate: sub.cutDate
          }
        })
        
        // Ordenar por fecha de corte descendente
        paymentRecords.sort((a, b) => {
          if (!a.cutDate) return 1
          if (!b.cutDate) return -1
          return new Date(b.cutDate).getTime() - new Date(a.cutDate).getTime()
        })
        
        setPayments(paymentRecords)
      } catch (err: any) {
        console.error('Error fetching payments:', err)
        if (mounted) setError('No se pudieron cargar los pagos')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchPayments()
    
    return () => {
      mounted = false
    }
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      case 'up_to_date':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
      case 'failed':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />
      case 'up_to_date':
        return <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'failed':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pagado'
      case 'up_to_date':
        return 'Al día'
      case 'pending':
        return 'Por vencer'
      case 'failed':
        return 'Fallido'
      default:
        return status
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Filtrar pagos
  const filteredPayments = payments.filter(payment => 
    filter === 'all' || payment.status === filter
  )

  // Calcular totales
  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + parseFloat(p.amount.replace(/[^0-9.-]+/g, '')), 0)
  
  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + parseFloat(p.amount.replace(/[^0-9.-]+/g, '')), 0)

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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-secondary tracking-tight">Historial de Pagos</h2>
        <p className="text-sm text-gray-500 dark:text-gray-300">Consulta tus facturas y estado de pagos</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-600 dark:text-yellow-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-600 dark:text-blue-400">Saldo pendiente</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">${totalPending.toFixed(2)}</div>
        </Card>
        <Card>
          <div className="text-sm text-blue-600 dark:text-blue-400">¡Gracias por mantenerte al día!</div>
          <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">Tu historial está en orden</div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'paid'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            Pagados
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            Pendientes
          </button>
        </div>
      </Card>

      {/* Lista de facturas */}
      {filteredPayments.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Receipt className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No hay registros</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {filter !== 'all' 
                ? 'No se encontraron resultados con los filtros aplicados' 
                : 'No tienes pagos registrados aún'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    <Receipt className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-200">{payment.plan}</div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Período: {formatDate(payment.startDate)} - {formatDate(payment.cutDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900 dark:text-secondary">{payment.amount}</div>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      {getStatusLabel(payment.status)}
                    </div>
                  </div>
                  {payment.status === 'paid' && (
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
