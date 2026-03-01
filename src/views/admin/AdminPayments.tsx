import React, { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Receipt,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Filter,
  DollarSign,
  TrendingUp,
  Users,
  Plus,
  CreditCard,
  Wallet,
  Smartphone,
  Gift,
  Calendar,
  X,
  ChevronDown,
} from "lucide-react";
import { MonthFilterSelect } from "../../components/ui/MonthFilterSelect";
import {
  paymentsApi,
  Payment,
  PaymentStats,
  Subscription,
  api,
  Client,
} from "../../services/api";

export default function AdminPayments() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [methodFilter, setMethodFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>("");
  const [monthFilter, setMonthFilter] = useState<string>(
    new Date().toISOString().slice(0, 7),
  ); // Current month (YYYY-MM)

  // Modal
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [notes, setNotes] = useState("");

  // Form state for creating payments
  const [showForm, setShowForm] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [subscriptionMap, setSubscriptionMap] = useState<
    Map<string, Subscription>
  >(new Map());
  const [selectedSubscription, setSelectedSubscription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [method, setMethod] = useState<
    "binance" | "zinli" | "pago_movil" | "free"
  >("binance");
  const [reference, setReference] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [payerIdNumber, setPayerIdNumber] = useState("");
  const [bank, setBank] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [statusFilter, methodFilter, subscriptionFilter, monthFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.method = methodFilter;

      // Fetch payments, subscriptions, and clients
      const [paymentsRes, subsRes, clientsRes] = await Promise.all([
        paymentsApi.list(params),
        api.get("/subscriptions"),
        api.get("/clients"),
      ]);
      console.log("Payments response:", paymentsRes.data);
      console.log("Payments data field:", paymentsRes.data?.data);

      // Store subscriptions and clients for later use
      const subs = subsRes.data?.data || subsRes.data || [];
      const clientsList = clientsRes.data?.data || clientsRes.data || [];
      setSubscriptions(subs);
      setClients(clientsList);

      // Create subscription map for quick lookup
      const subMap = new Map<string, Subscription>();
      subs.forEach((sub: Subscription) => {
        if (sub.id) subMap.set(sub.id, sub);
      });
      setSubscriptionMap(subMap);

      if (paymentsRes.data?.ok) {
        // According to docs: res.data.data is Payment[]
        const paymentsData = paymentsRes.data.data || [];
        console.log("Parsed payments:", paymentsData);
        setPayments(paymentsData);
      }
    } catch (err: any) {
      console.error("Error fetching payments:", err);
      setError("Error al cargar los pagos");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await paymentsApi.getStats();
      if (res.data?.ok && res.data?.data) {
        setStats(res.data.data);
      }
    } catch (err: any) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const [subsRes, clientsRes] = await Promise.all([
        api.get("/subscriptions"),
        api.get("/clients"),
      ]);
      const subs = subsRes.data?.data || subsRes.data || [];
      const clientsList = clientsRes.data?.data || clientsRes.data || [];
      setSubscriptions(subs);
      setClients(clientsList);
    } catch (err: any) {
      console.error("Error fetching subscriptions:", err);
    }
  };

  // Get client name by ID
  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId || c.uid === clientId);
    return client?.name || clientId;
  };

  // Get client info and subscription details by subscription ID
  const getClientBySubscription = (subscriptionId: string) => {
    const sub = subscriptionMap.get(subscriptionId);
    if (!sub)
      return {
        clientId: subscriptionId,
        clientName: "Unknown",
        plan: "-",
        amount: "-",
        status: "-",
      };
    const client = clients.find(
      (c) => c.id === sub.clientId || c.uid === sub.clientId,
    );
    return {
      clientId: sub.clientId,
      clientName: client?.name || "Unknown",
      plan: sub.plan,
      amount: sub.amount,
      status: sub.status || "-",
    };
  };

  // Handle method change to auto-set currency
  const handleMethodChange = (
    newMethod: "binance" | "zinli" | "pago_movil" | "free",
  ) => {
    setMethod(newMethod);
    // Auto-set currency based on method
    if (newMethod === "binance") {
      setCurrency("USDT");
    } else if (newMethod === "zinli") {
      setCurrency("USD");
    } else if (newMethod === "pago_movil") {
      setCurrency("VES");
    } else if (newMethod === "free") {
      setCurrency("USD");
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubscription) {
      setError("Por favor selecciona una suscripción");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const paymentData: any = {
        subscriptionId: selectedSubscription,
        amount: parseFloat(amount),
        currency,
        method,
        date: new Date().toISOString(),
      };

      // Add method-specific fields
      if (method === "binance" || method === "zinli") {
        paymentData.reference = reference;
        paymentData.payerEmail = payerEmail;
        if (receiptUrl) paymentData.receiptUrl = receiptUrl;
      } else if (method === "pago_movil") {
        paymentData.payerPhone = payerPhone;
        paymentData.payerIdNumber = payerIdNumber;
        paymentData.bank = bank;
        if (reference) paymentData.reference = reference;
      } else if (method === "free") {
        paymentData.free = true;
        paymentData.amount = 0;
      }

      await paymentsApi.create(paymentData);

      setFormSuccess(
        "Pago registrado exitosamente. Está pendiente de verificación.",
      );
      setShowForm(false);

      // Reset form
      setSelectedSubscription("");
      setAmount("");
      setReference("");
      setPayerEmail("");
      setPayerPhone("");
      setPayerIdNumber("");
      setBank("");
      setReceiptUrl("");

      // Refresh payments
      fetchPayments();
      fetchStats();
    } catch (err: any) {
      console.error("Error creating payment:", err);
      setError(err.response?.data?.message || "Error al registrar el pago");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedPayment) return;

    try {
      setSubmitting(true);
      setError(null);
      await paymentsApi.verify(selectedPayment.id, notes || undefined);
      setActionSuccess("Pago aprobado exitosamente");
      setShowVerifyModal(false);
      setSelectedPayment(null);
      setNotes("");
      fetchPayments();
      fetchStats();
    } catch (err: any) {
      console.error("Error verifying payment:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Error al aprobar el pago";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPayment) return;

    try {
      setSubmitting(true);
      setError(null);
      await paymentsApi.reject(selectedPayment.id, notes || undefined);
      setActionSuccess("Pago rechazado");
      setShowRejectModal(false);
      setSelectedPayment(null);
      setNotes("");
      fetchPayments();
      fetchStats();
    } catch (err: any) {
      console.error("Error rejecting payment:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Error al rechazar el pago";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "verified":
        return "Aprobado";
      case "pending":
        return "Pendiente";
      case "rejected":
        return "Rechazado";
      default:
        return status;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "binance":
        return "Binance";
      case "zinli":
        return "Zinli";
      case "pago_movil":
        return "Pago Móvil";
      case "free":
        return "Promocional";
      default:
        return method;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    // Handle crypto currencies like USDT
    if (currency === "USDT" || currency === "BTC" || currency === "ETH") {
      return `${currency} ${amount.toFixed(2)}`;
    }
    // Handle VES with proper locale
    if (currency === "VES") {
      return new Intl.NumberFormat("es-VE", {
        style: "currency",
        currency: "VES",
      }).format(amount);
    }
    // Default to USD
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Filter payments by search, subscription, and month
  const filteredPayments = payments.filter((payment) => {
    // Filter by subscription
    if (subscriptionFilter && payment.subscriptionId !== subscriptionFilter) {
      return false;
    }

    // Filter by month
    if (monthFilter) {
      const paymentDate = new Date(payment.date);
      const paymentMonth = paymentDate.toISOString().slice(0, 7); // YYYY-MM
      if (paymentMonth !== monthFilter) {
        return false;
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const clientInfo = getClientBySubscription(payment.subscriptionId);
      return (
        payment.reference?.toLowerCase().includes(query) ||
        payment.payerEmail?.toLowerCase().includes(query) ||
        payment.subscriptionId.toLowerCase().includes(query) ||
        payment.bank?.toLowerCase().includes(query) ||
        clientInfo.clientName.toLowerCase().includes(query)
      );
    }

    return true;
  });

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Gestión de Pagos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Administra y verifica los pagos de los clientes
          </p>
        </div>
        <Button
          onClick={() => {
            fetchSubscriptions();
            setShowForm(!showForm);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Pago
        </Button>
      </div>

      {formSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      {actionSuccess && !formSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-600 dark:text-yellow-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Payment Form */}
      {showForm && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Registrar Nuevo Pago</h3>
          <form onSubmit={handleCreatePayment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Suscripción *
                </label>
                <select
                  value={selectedSubscription}
                  onChange={(e) => setSelectedSubscription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Selecciona una suscripción</option>
                  {subscriptions.map((sub) => (
                    <option key={sub.id ?? ""} value={sub.id ?? ""}>
                      {sub.plan} - {sub.amount} ({sub.status}) -{" "}
                      {getClientBySubscription(sub.id ?? "").clientName ||
                        "Unknown"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Método de Pago *
                </label>
                <select
                  value={method}
                  onChange={(e) => handleMethodChange(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                >
                  <option value="binance">Binance</option>
                  <option value="zinli">Zinli</option>
                  <option value="pago_movil">Pago Móvil</option>
                  <option value="free">Promocional (Gratis)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Monto *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50.00"
                  required={method !== "free"}
                  disabled={method === "free"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Moneda
                </label>
                <div className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-medium">
                  {currency === "USDT"
                    ? "USDT (CRIPTOMONEDA)"
                    : currency === "USD"
                      ? "USD (DÓLAR ESTADOUNIDENSE)"
                      : "VES (BOLÍVAR)"}
                </div>
              </div>
            </div>

            {/* Method-specific fields */}
            {(method === "binance" || method === "zinli") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Referencia *
                  </label>
                  <Input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder={
                      method === "binance" ? "BIN_ABC123XYZ" : "ZN_123456789"
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
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

            {method === "pago_movil" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
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
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar Pago"
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Stats Cards - Mobile First */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {/* Total */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3 sm:p-4 hover:scale-[1.02] transition-transform cursor-pointer">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <Receipt className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium">Total</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
              {stats.total}
            </div>
          </div>

          {/* Pending */}
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 sm:p-4 hover:scale-[1.02] transition-transform cursor-pointer">
            <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400">
              <Clock className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium">Pendientes</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">
              {stats.pending}
            </div>
          </div>

          {/* Verified */}
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-3 sm:p-4 hover:scale-[1.02] transition-transform cursor-pointer">
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium">Aprobados</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
              {stats.verified}
            </div>
          </div>

          {/* Rejected */}
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-3 sm:p-4 hover:scale-[1.02] transition-transform cursor-pointer">
            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <XCircle className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium">Rechazados</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-red-700 dark:text-red-300 mt-1">
              {stats.rejected}
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl p-3 sm:p-4 hover:scale-[1.02] transition-transform cursor-pointer col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium">
                Monto Total
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
              ${stats.totalAmount.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Filters - Mobile First Design */}
      <Card className="p-3 sm:p-4">
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 z-10 text-slate-900 dark:text-slate-200" />
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer hover:border-primary transition-colors min-w-32.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Estado</option>
              <option value="pending">Pendiente</option>
              <option value="verified">Aprobado</option>
              <option value="rejected">Rechazado</option>
            </select>
            <Filter className="w-4 h-4 absolute right-7 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Method Filter */}
          <div className="relative shrink-0">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer hover:border-primary transition-colors min-w-32.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Método</option>
              <option value="binance">Binance</option>
              <option value="zinli">Zinli</option>
              <option value="pago_movil">Pago Móvil</option>
              <option value="free">Gratis</option>
            </select>
            <CreditCard className="w-4 h-4 absolute right-7 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Month Filter */}
          <div className="shrink-0">
            <MonthFilterSelect
              value={monthFilter}
              onChange={setMonthFilter}
            />
          </div>

          {/* Active Filters */}
            {(statusFilter ||
            methodFilter ||
            subscriptionFilter ||
            monthFilter ||
            searchQuery) && (
            <Button
              onClick={() => {
                setStatusFilter("");
                setMethodFilter("");
                setSubscriptionFilter("");
                setMonthFilter(new Date().toISOString().slice(0, 7));
                setSearchQuery("");
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
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
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
            <Receipt className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
              No hay pagos
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              No se encontraron pagos con los filtros aplicados
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment) => (
            <Card
              key={payment.id}
              className="hover:shadow-md transition-shadow p-3 sm:p-4"
            >
              {/* Mobile-first layout */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Left side - Info */}
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div
                    className={`shrink-0 p-2 rounded-full w-10 h-10 flex items-center justify-center ${
                      payment.status === "verified"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : payment.status === "pending"
                          ? "bg-yellow-100 dark:bg-yellow-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    {payment.status === "verified"
                      ? "✅"
                      : payment.status === "pending"
                        ? "⏳"
                        : "❌"}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                        {
                          getClientBySubscription(payment.subscriptionId)
                            .clientName
                        }
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === "verified"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : payment.status === "pending"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {getStatusLabel(payment.status)}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      <span className="mr-2">
                        💳 {getMethodLabel(payment.method)}
                      </span>
                      <span className="mr-2">
                        📋{" "}
                        {getClientBySubscription(payment.subscriptionId).plan}
                      </span>
                      <span>📅 {formatDate(payment.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Right side - Amount & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-2 ml-13 sm:ml-0">
                  <div className="text-right">
                    <div className="font-bold text-lg sm:text-xl text-slate-900 dark:text-secondary">
                      {formatCurrency(payment.amount, payment.currency)}
                    </div>
                  </div>

                  {/* Action Buttons - Only show on pending */}
                  {payment.status === "pending" && (
                    <div className="flex gap-1">
                      <Button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowVerifyModal(true);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Aprobar"
                        variant="ghost"
                        size="icon"
                      >
                        ✓
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowRejectModal(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Rechazar"
                        variant="ghost"
                        size="icon"
                      >
                        ✗
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info - Collapsible on mobile */}
              {(payment.reference || payment.payerEmail || payment.bank) && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {payment.reference && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        🔗 {payment.reference}
                      </span>
                    )}
                    {payment.payerEmail && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        📧 {payment.payerEmail}
                      </span>
                    )}
                    {payment.bank && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        🏦 {payment.bank}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {payment.notes && (
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium">💬 Nota:</span>{" "}
                    {payment.notes}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Aprobar Pago</h3>
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Monto
                </p>
                <p className="font-semibold">
                  {formatCurrency(
                    selectedPayment.amount,
                    selectedPayment.currency,
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  rows={3}
                  placeholder="Agregar una nota..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowVerifyModal(false);
                    setSelectedPayment(null);
                    setNotes("");
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleVerify} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Aprobando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprobar Pago
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Rechazar Pago</h3>
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Monto
                </p>
                <p className="font-semibold">
                  {formatCurrency(
                    selectedPayment.amount,
                    selectedPayment.currency,
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Razón del rechazo *
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  rows={3}
                  placeholder="Indica la razón del rechazo..."
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedPayment(null);
                    setNotes("");
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={submitting || !notes}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Rechazando...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Rechazar Pago
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Helper function that was missing
function getStatusStatusIcon(status: string) {
  switch (status) {
    case "verified":
      return <CheckCircle className="w-3 h-3" />;
    case "pending":
      return <Clock className="w-3 h-3" />;
    case "rejected":
      return <XCircle className="w-3 h-3" />;
    default:
      return <Clock className="w-3 h-3" />;
  }
}
