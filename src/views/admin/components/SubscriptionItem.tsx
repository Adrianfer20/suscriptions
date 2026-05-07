import React, { useState, useMemo } from "react";
import { Copy, Pencil, Trash2, CheckCircle, ChevronDown, ChevronUp, Loader2, AlertCircle, Clock, RefreshCw, Calendar, DollarSign, MapPin, Hash, Key, User } from "lucide-react";
import { subscriptionsApi } from "../../../services/api";
import toast from "react-hot-toast";
import { Button } from '../../../components/ui/Button'

const getDaysUntilCutDate = (cutDate: string): number | null => {
  if (!cutDate) return null;
  const parts = cutDate.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutDateObj = new Date(year, month - 1, day);
    const diffTime = cutDateObj.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
};

const getCutDateStatus = (cutDate: string) => {
  const days = getDaysUntilCutDate(cutDate);
  if (days === null) return { label: 'Sin fecha', color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-700', border: 'border-slate-200 dark:border-slate-600', icon: null, accent: '#94a3b8' };
  if (days < 0) return { label: `Vencida hace ${Math.abs(days)}d`, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: AlertCircle, accent: '#dc2626' };
  if (days <= 3) return { label: `${days}d restantes`, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', icon: Clock, accent: '#ea580c' };
  if (days <= 7) return { label: `${days}d por vencer`, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', icon: Clock, accent: '#d97706' };
  return { label: `${days}d restantes`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', icon: CheckCircle, accent: '#059669' };
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string; gradient: string }> = {
  active: { label: "Activa", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30", border: "border-emerald-200 dark:border-emerald-700", dot: "bg-emerald-500", gradient: "from-emerald-400 to-emerald-600" },
  about_to_expire: { label: "Por Vencer", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30", border: "border-amber-200 dark:border-amber-700", dot: "bg-amber-500", gradient: "from-amber-400 to-orange-500" },
  suspended: { label: "Suspendida", color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/30", border: "border-orange-200 dark:border-orange-700", dot: "bg-orange-500", gradient: "from-orange-400 to-orange-600" },
  paused: { label: "Pausada", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30", border: "border-blue-200 dark:border-blue-700", dot: "bg-blue-500", gradient: "from-blue-400 to-blue-600" },
  cancelled: { label: "Cancelada", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/30", border: "border-red-200 dark:border-red-700", dot: "bg-red-500", gradient: "from-red-400 to-red-600" },
};

const STATUS_OPTIONS = [
  { value: "active", label: "Activa" },
  { value: "about_to_expire", label: "Por Vencer" },
  { value: "suspended", label: "Suspendida" },
  { value: "paused", label: "Pausada" },
  { value: "cancelled", label: "Cancelada" },
];

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-pink-500 to-rose-600",
  "from-indigo-500 to-blue-600",
];

const getAvatarGradient = (name: string) => {
  const idx = (name || "U").charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
};

export default function SubscriptionItem({
  sub,
  client,
  onEdit,
  onDelete,
  onCopy,
  onRenew,
  PLAN_LABELS,
  isAdmin = false,
  onStatusChange,
}: {
  sub: any;
  client: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy?: (value: string) => void;
  onRenew?: (id: string) => void;
  PLAN_LABELS: Record<string, string>;
  isAdmin?: boolean;
  onStatusChange?: (id: string, newStatus: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>("");

  const clientName = client?.name || "Cliente desconocido";
  const initial = clientName.charAt(0).toUpperCase();
  const avatarGradient = getAvatarGradient(clientName);

  const handleStatusChangeRequest = (newStatus: string) => {
    setPendingStatus(newStatus);
    setShowConfirmModal(true);
  };

  const handleStatusChange = async () => {
    if (!sub.id || !pendingStatus) return;
    const previousStatus = sub.status;
    setChangingStatus(true);
    setShowConfirmModal(false);
    if (onStatusChange) onStatusChange(sub.id, pendingStatus);
    try {
      await subscriptionsApi.updateStatus(sub.id, pendingStatus as 'active' | 'about_to_expire' | 'suspended' | 'paused' | 'cancelled');
    } catch (error: any) {
      if (onStatusChange) onStatusChange(sub.id, previousStatus);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "Error al cambiar el status";
      toast.error(errorMessage);
    } finally {
      setChangingStatus(false);
      setPendingStatus("");
    }
  };

  const currentStatus = sub.status || "active";
  const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.active;
  const cutDateStatus = getCutDateStatus(sub.cutDate);
  const daysUntilCut = getDaysUntilCutDate(sub.cutDate);
  const CutIcon = cutDateStatus.icon;

  const planLabel = PLAN_LABELS[sub.plan] || sub.plan || "Sin plan";

  return (
    <>
      <div className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 w-full flex">
        <div className="flex-1 min-w-0">
          <div className="p-4 sm:p-5">
          {/* Header row */}
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Avatar */}
            <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${avatarGradient} flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0`}>
              {initial}
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate text-base">{clientName}</h3>
                  {client?.email && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{client.email}</p>
                  )}
                </div>

                {/* Status badge (non-admin) or select (admin) */}
                {isAdmin ? (
                  <div className="relative shrink-0">
                    <select
                      value={currentStatus}
                      onChange={(e) => handleStatusChangeRequest(e.target.value)}
                      disabled={changingStatus}
                      className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-semibold border ${statusConfig.border} ${statusConfig.bg} ${statusConfig.color} cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none`}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                    {changingStatus && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-800/60 rounded-lg">
                        <Loader2 size={14} className="animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                ) : (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusConfig.border} ${statusConfig.bg} ${statusConfig.color} shrink-0`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`} />
                    {statusConfig.label}
                  </span>
                )}
              </div>

              {/* Plan + cut date badges */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 dark:bg-primary/20 text-primary dark:text-secondary">
                  {planLabel}
                </span>

                {sub.cutDate && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${cutDateStatus.border} ${cutDateStatus.bg} ${cutDateStatus.color}`}>
                    {CutIcon && <CutIcon size={11} />}
                    {formatDate(sub.cutDate)}
                  </span>
                )}

                {sub.amount && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    <DollarSign size={11} />
                    {sub.amount}
                  </span>
                )}
              </div>
            </div>

            {/* Expand button */}
            <Button
              onClick={() => setExpanded(!expanded)}
              className="rounded-xl shrink-0 mt-1"
              variant="ghost"
              size="icon"
              aria-expanded={expanded}
              aria-label={expanded ? "Contraer detalles" : "Expandir detalles"}
            >
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </Button>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="border-t border-slate-100 dark:border-slate-700">
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Start date */}
                {sub.startDate && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Inicio</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{formatDate(sub.startDate)}</p>
                    </div>
                  </div>
                )}

                {/* Days until cut */}
                {daysUntilCut !== null && (
                  <div className={`flex items-center gap-3 p-3 rounded-xl ${cutDateStatus.bg}`}>
                    <div className={`w-9 h-9 rounded-lg ${cutDateStatus.bg} border ${cutDateStatus.border} flex items-center justify-center shrink-0`}>
                      {CutIcon ? (
                        <CutIcon size={16} className={cutDateStatus.color} />
                      ) : (
                        <Clock size={16} className="text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Próximo corte</p>
                      <p className={`text-sm font-medium ${cutDateStatus.color}`}>{cutDateStatus.label}</p>
                    </div>
                  </div>
                )}

                {/* Country */}
                {sub.country && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                      <MapPin size={16} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400">País</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{sub.country}</p>
                    </div>
                  </div>
                )}

                {/* Kit number */}
                {sub.kitNumber && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                      <Hash size={16} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Nº Kit</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{sub.kitNumber}</p>
                    </div>
                  </div>
                )}

                {/* Password */}
                {sub.passwordSub && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 sm:col-span-2">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                      <Key size={16} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Contraseña del servicio</p>
                      <p className="text-sm font-mono font-medium text-slate-900 dark:text-white truncate">{sub.passwordSub}</p>
                    </div>
                    <Button
                      onClick={() => onCopy?.(sub.passwordSub)}
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      aria-label="Copiar contraseña"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <Button
                  onClick={() => onEdit(sub)}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                >
                  <Pencil size={14} />
                  Editar
                </Button>
                {onRenew && (
                  <Button
                    onClick={() => onRenew(sub.id)}
                    variant="secondary"
                    size="sm"
                    className="gap-1.5 text-xs"
                  >
                    <RefreshCw size={14} />
                    Renovar
                  </Button>
                )}
                <div className="flex-1" />
                <Button
                  onClick={() => onDelete(sub.id)}
                  variant="danger"
                  size="sm"
                  className="gap-1.5 text-xs"
                >
                  <Trash2 size={14} />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Status gradient bar on the right side */}
        <div className={`w-1.5 self-stretch bg-linear-to-b ${statusConfig.gradient} opacity-80 shrink-0`} />
      </div>

      {/* Confirmation modal */}
      {showConfirmModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowConfirmModal(false)}
            aria-hidden="true"
          />
          <div className="fixed z-50 bottom-0 left-0 right-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-sm w-full sm:w-auto animate-in slide-in-from-bottom-10 sm:slide-in-from-top-10 duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl border-t sm:border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  <AlertCircle size={20} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirmar cambio</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Nuevo estado: <span className={`font-semibold ${STATUS_CONFIG[pendingStatus]?.color || ''}`}>{STATUS_CONFIG[pendingStatus]?.label || pendingStatus}</span>
                  </p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                ¿Cambiar el estado de esta suscripción?
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 text-sm font-medium"
                  size="md"
                  variant="outline"
                  disabled={changingStatus}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleStatusChange}
                  disabled={changingStatus}
                  className="flex-1 text-sm font-medium flex items-center justify-center gap-1.5"
                  size="md"
                  variant="primary"
                >
                  {changingStatus && <Loader2 size={16} className="animate-spin" />}
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
