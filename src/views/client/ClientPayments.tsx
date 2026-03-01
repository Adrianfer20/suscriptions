import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Receipt, Download, Calendar, CheckCircle, Clock, XCircle, Loader2, AlertCircle, Plus, CreditCard, Wallet, Smartphone, Gift, Filter, X, Search, ChevronDown } from 'lucide-react'
import { MonthFilterSelect } from '../../components/ui/MonthFilterSelect'
import api, { paymentsApi, Payment, Subscription } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function ClientPayments() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  
  // Form state
  const [selectedSubscription, setSelectedSubscription] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [method, setMethod] = useState<'binance' | 'zinli' | 'pago_movil' | 'free'>('binance')
  const [reference, setReference] = useState('')
  const [payerEmail, setPayerEmail] = useState('')
  const [payerPhone, setPayerPhone] = useState('')
  const [payerIdNumber, setPayerIdNumber] = useState('')
  const [bank, setBank] = useState('')
  const [receiptUrl, setReceiptUrl] = useState('')

  // Handle method change to auto-set currency
  const handleMethodChange = (newMethod: 'binance' | 'zinli' | 'pago_movil' | 'free') => {
    setMethod(newMethod)
    // Auto-set currency based on method (amount is entered by the client)
    if (newMethod === 'binance') {
      setCurrency('USDT')
    } else if (newMethod === 'zinli') {
      setCurrency('USD')
    } else if (newMethod === 'pago_movil') {
      setCurrency('VES')
    } else if (newMethod === 'free') {
      setCurrency('USD')
    }
  }

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
        
        // Fetch subscriptions first to get user's subscription IDs
        const subsRes = await api.get('/subscriptions')
        const allSubscriptions = subsRes.data?.data || subsRes.data || []
        const userSubscriptions = (allSubscriptions as Subscription[])
          .filter((sub: Subscription) => sub.clientId === user.id)
        
        if (mounted) setSubscriptions(userSubscriptions)
        
        // Get user's subscription IDs
        const userSubscriptionIds = new Set(userSubscriptions.map((sub: Subscription) => sub.id))
        
        // Fetch all payments and filter by user's subscriptions
        const paymentsRes = await paymentsApi.list({ limit: 100 })
        console.log('Client payments response:', paymentsRes.data)
        
        if (paymentsRes.data?.ok) {
          const allPayments = paymentsRes.data.data || []
          // Filter to only show payments from user's subscriptions
          const userPayments = allPayments.filter((payment: Payment) => 
            userSubscriptionIds.has(payment.subscriptionId)
          )
          if (mounted) setPayments(userPayments)
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

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubscription) {
      setError('Por favor selecciona una suscripción')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      
      const paymentData: any = {
        subscriptionId: selectedSubscription,
        amount: parseFloat(amount),
        currency,
        method,
        date: new Date().toISOString()
      }

      // Add method-specific fields
      if (method === 'binance' || method === 'zinli') {
        paymentData.reference = reference
        paymentData.payerEmail = payerEmail
        if (receiptUrl) paymentData.receiptUrl = receiptUrl
      } else if (method === 'pago_movil') {
        paymentData.payerPhone = payerPhone
        paymentData.payerIdNumber = payerIdNumber
        paymentData.bank = bank
        if (reference) paymentData.reference = reference
      } else if (method === 'free') {
        paymentData.free = true
        paymentData.amount = 0
      }

      await paymentsApi.create(paymentData)
      
      setFormSuccess('Pago registrado exitosamente. Será verificado por un administrador.')
      setShowForm(false)
      
      // Reset form
      setSelectedSubscription('')
      setAmount('')
      setMethod('binance')
      setReference('')
      setPayerEmail('')
      setPayerPhone('')
      setPayerIdNumber('')
      setBank('')
      setReceiptUrl('')
      
      // Refresh payments
      const paymentsRes = await paymentsApi.list({ limit: 100 })
      console.log('Refresh payments response:', paymentsRes.data)
      
      if (paymentsRes.data?.ok) {
        // According to docs: res.data.data is Payment[]
        const paymentsData = paymentsRes.data.data || []
        setPayments(paymentsData)
      }
    } catch (err: any) {
      console.error('Error submitting payment:', err)
      setError(err.response?.data?.message || 'Error al registrar el pago')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
      case 'rejected':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Aprobado'
      case 'pending':
        return 'Pendiente'
      case 'rejected':
        return 'Rechazado'
      default:
        return status
    }
  }

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'binance':
        return 'Binance'
      case 'zinli':
        return 'Zinli'
      case 'pago_movil':
        return 'Pago Móvil'
      case 'free':
        return 'Promocional (Gratis)'
      default:
        return method
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'binance':
        return <CreditCard className="w-4 h-4" />
      case 'zinli':
        return <Wallet className="w-4 h-4" />
      case 'pago_movil':
        return <Smartphone className="w-4 h-4" />
      case 'free':
        return <Gift className="w-4 h-4" />
      default:
        return <CreditCard className="w-4 h-4" />
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const formatCurrency = (amount: number, currency: string) => {
    // Handle crypto currencies like USDT
    if (currency === 'USDT' || currency === 'BTC' || currency === 'ETH') {
      return `${currency} ${amount.toFixed(2)}`
    }
    // Handle VES with proper locale
    if (currency === 'VES') {
      return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amount)
    }
    // Default to USD
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount)
  }

  // Filter payments
  const [monthFilter, setMonthFilter] = useState<string>(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    if (formSuccess) {
      toast.success(formSuccess)
      setFormSuccess(null)
    }
  }, [formSuccess])

  useEffect(() => {
    if (actionSuccess) {
      toast.success(actionSuccess)
      setActionSuccess(null)
    }
  }, [actionSuccess])

  useEffect(() => {
    if (error) {
      toast.error(error)
      setError(null)
    }
  }, [error])
  
  const filteredPayments = payments.filter(payment => {
    // Filter by status
    if (filter !== 'all' && payment.status !== filter) {
      return false
    }
    // Filter by month
    if (monthFilter) {
      const paymentDate = new Date(payment.date)
      const paymentMonth = paymentDate.toISOString().slice(0, 7)
      if (paymentMonth !== monthFilter) {
        return false
      }
    }
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        payment.reference?.toLowerCase().includes(query) ||
        payment.payerEmail?.toLowerCase().includes(query) ||
        payment.subscriptionId.toLowerCase().includes(query) ||
        payment.bank?.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Calculate totals
  const totalVerified = payments
    .filter(p => p.status === 'verified')
    .reduce((sum, p) => sum + p.amount, 0)
  
  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-secondary tracking-tight">Mis Pagos</h2>
          <p className="text-sm text-gray-500 dark:text-gray-300">Consulta tus pagos y registra nuevos</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Registrar Pago
        </Button>
      </div>

      {/* formSuccess/actionSuccess/error are displayed via toast notifications */}

      {/* Payment Form */}
      {showForm && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Registrar Nuevo Pago</h3>
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Suscripción *
                </label>
                <select
                  value={selectedSubscription}
                  onChange={(e) => setSelectedSubscription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Selecciona una suscripción</option>
                  {subscriptions.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.plan} - {sub.amount} ({sub.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Método de Pago *
                </label>
                <select
                  value={method}
                  onChange={(e) => handleMethodChange(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="binance">Binance</option>
                  <option value="zinli">Zinli</option>
                  <option value="pago_movil">Pago Móvil</option>
                  <option value="free">Promocional (Gratis)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monto *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50.00"
                  required={method !== 'free'}
                  disabled={method === 'free'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Moneda
                </label>
                <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-white font-medium">
                  {currency === 'USDT' ? 'USDT (CRIPTOMONEDA)' : currency === 'USD' ? 'USD (DÓLAR ESTADOUNIDENSE)' : 'VES (BOLÍVAR)'}
                </div>
              </div>
            </div>

            {/* Method-specific fields */}
            {(method === 'binance' || method === 'zinli') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Referencia *
                  </label>
                  <Input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder={method === 'binance' ? 'BIN_ABC123XYZ' : 'ZN_123456789'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={payerEmail}
                    onChange={(e) => setPayerEmail(e.target.value)}
                    placeholder="usuario@email.com"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL del Comprobante
                  </label>
                  <Input
                    type="url"
                    value={receiptUrl}
                    onChange={(e) => setReceiptUrl(e.target.value)}
                    placeholder="https://binance.com/transaction/..."
                  />
                </div>
              </div>
            )}

            {method === 'pago_movil' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Teléfono *
                  </label>
                  <Input
                    type="tel"
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    placeholder="+584121234567"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cédula *
                  </label>
                  <Input
                    type="text"
                    value={payerIdNumber}
                    onChange={(e) => setPayerIdNumber(e.target.value)}
                    placeholder="12345678"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Banco *
                  </label>
                  <Input
                    type="text"
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    placeholder="Banco de Venezuela"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Referencia
                  </label>
                  <Input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="REF123456"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  'Registrar Pago'
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="text-sm text-green-600 dark:text-green-400">Total Aprobado</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {formatCurrency(totalVerified, currency)}
          </div>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Pendiente</div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {formatCurrency(totalPending, currency)}
          </div>
        </Card>
      </div>

      {/* Filters - Mobile First */}
      <Card className="p-3 sm:p-4">
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 z-10 text-gray-900 dark:text-gray-200" />
          <Input
            type="text"
            placeholder="Buscar pagos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        {/* Filter Section - Mobile First */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          {/* Status Filter */}
          <div className="relative shrink-0">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white cursor-pointer hover:border-primary transition-colors min-w-32.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="verified">Aprobado</option>
              <option value="rejected">Rechazado</option>
            </select>
            <Filter className="w-4 h-4 absolute right-7 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Month Filter */}
          <div className="shrink-0">
            <MonthFilterSelect
              value={monthFilter}
              onChange={setMonthFilter}
            />
          </div>

          {/* Active Filters */}
          {(filter !== 'all' || monthFilter !== new Date().toISOString().slice(0, 7) || searchQuery) && (
            <Button
              onClick={() => {
                setFilter('all')
                setMonthFilter(new Date().toISOString().slice(0, 7))
                setSearchQuery('')
              }}
              className="shrink-0 flex items-center gap-1.5 text-center text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors px-3 py-2"
              variant="ghost"
            >
              <X className="w-4 h-4" />
              <span>Limpiar</span>
            </Button>
          )}
        </div>

        {/* Active Filters Count */}
        {filteredPayments.length > 0 && (
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {filteredPayments.length} pago
            {filteredPayments.length !== 1 ? "s" : ""} encontrado
            {filteredPayments.length !== 1 ? "s" : ""}
          </div>
        )}
      </Card>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Receipt className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No hay registros</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {filter !== 'all' || monthFilter !== new Date().toISOString().slice(0, 7)
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
                    {getMethodIcon(payment.method)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-200">
                      {getMethodLabel(payment.method)}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(payment.date)}
                      </span>
                      {payment.reference && (
                        <span>Ref: {payment.reference}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900 dark:text-secondary">
                      {formatCurrency(payment.amount, payment.currency)}
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      {getStatusLabel(payment.status)}
                    </div>
                  </div>
                  {payment.status === 'verified' && (
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              {payment.notes && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Nota:</span> {payment.notes}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
