import React, { useState, useMemo } from "react";
import { Copy, Pencil, Trash2, CheckCircle, ChevronDown, ChevronUp, Loader2, AlertCircle, Clock } from "lucide-react";
import { subscriptionsApi } from "../../../services/api";
import toast from "react-hot-toast";
import { Button } from '../../../components/ui/Button'

// Función para calcular días hasta la fecha de corte
const getDaysUntilCutDate = (cutDate: string): number | null => {
  if (!cutDate) return null;
  
  // Manejar formato YYYY-MM-DD
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

// Obtener configuración visual según estado de la fecha de corte
const getCutDateStatus = (cutDate: string) => {
  const days = getDaysUntilCutDate(cutDate);
  if (days === null) return { label: 'Sin fecha', color: 'text-gray-400', bg: 'bg-gray-100', icon: null };
  if (days < 0) return { label: 'Vencida', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', icon: AlertCircle };
  if (days <= 7) return { label: `${days}d por vencer`, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', icon: Clock };
  return { label: `${days}d restantes`, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle };
};

const STATUS_CONFIG: Record<string, { label: string; bgColor: string; textColor: string }> = {
  active: { label: "Activa", bgColor: "bg-green-100 dark:bg-green-900/30", textColor: "text-green-700 dark:text-green-400" },
  about_to_expire: { label: "Por Vencer", bgColor: "bg-yellow-100 dark:bg-yellow-900/30", textColor: "text-yellow-700 dark:text-yellow-400" },
  suspended: { label: "Suspendida", bgColor: "bg-orange-100 dark:bg-orange-900/30", textColor: "text-orange-700 dark:text-orange-400" },
  paused: { label: "Pausada", bgColor: "bg-blue-100 dark:bg-blue-900/30", textColor: "text-blue-700 dark:text-blue-400" },
  cancelled: { label: "Cancelada", bgColor: "bg-red-100 dark:bg-red-900/30", textColor: "text-red-700 dark:text-red-400" },
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "about_to_expire", label: "About to Expire" },
  { value: "suspended", label: "Suspended" },
  { value: "paused", label: "Paused" },
  { value: "cancelled", label: "Cancelled" },
];

export default function SubscriptionItem({ 
  sub, 
  client, 
  onEdit, 
  onDelete, 
  onCopy,
  PLAN_LABELS,
  isAdmin = false,
  onStatusChange,
}: {
  sub: any;
  client: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy?: (value: string) => void;
  PLAN_LABELS: Record<string, string>;
  isAdmin?: boolean;
  onStatusChange?: (id: string, newStatus: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>("");

  const handleStatusChangeRequest = (newStatus: string) => {
    setPendingStatus(newStatus);
    setShowConfirmModal(true);
  };

  const handleStatusChange = async () => {
    if (!sub.id || !pendingStatus) return;
    
    const previousStatus = sub.status;
    setChangingStatus(true);
    setShowConfirmModal(false);

    // Optimistic update
    if (onStatusChange) {
      onStatusChange(sub.id, pendingStatus);
    }

    try {
      await subscriptionsApi.updateStatus(sub.id, pendingStatus as 'active' | 'about_to_expire' | 'suspended' | 'paused' | 'cancelled');
    } catch (error: any) {
      // Rollback on error
      if (onStatusChange) {
        onStatusChange(sub.id, previousStatus);
      }
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "Error al cambiar el status";
      toast.error(errorMessage);
    } finally {
      setChangingStatus(false);
      setPendingStatus("");
    }
  };

  const currentStatus = sub.status || "inactive";
  const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.inactive;
  
  // Calcular estado de la fecha de corte
  const cutDateStatus = getCutDateStatus(sub.cutDate);

  return (
    <>
      <div className="group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-3 sm:p-4 hover:shadow-xl hover:border-secondary/20 transition-all duration-300 w-full overflow-hidden">
        {/* Mobile-First: layout vertical en móvil, horizontal en pantallas más grandes */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          {/* Avatar + Info del cliente */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Touch target mínimo 44px para avatar */}
            <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-secondary/10 dark:bg-secondary/20 flex items-center justify-center text-secondary font-bold text-lg border-2 border-secondary/30 shrink-0">
              {client?.name?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white truncate text-base sm:text-sm">
                {client?.name || "Cliente desconocido"}
              </h3>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-xs font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-md">{PLAN_LABELS[sub.plan] || sub.plan}</span>
                {/* Badge de fecha de corte con estado visual */}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md flex items-center gap-1 ${cutDateStatus.bg} ${cutDateStatus.color}`}>
                  {cutDateStatus.icon && <cutDateStatus.icon size={12} />}
                  {sub.cutDate || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Status + Acciones */}
          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            {/* Status Badge o Select (solo admin) - Mobile: botón expandible */}
            {isAdmin ? (
              /* Mobile-First: Select más grande y fácil de tocar */
              <div className="relative flex-1 sm:flex-none sm:w-auto">
                <select
                  value={currentStatus}
                  onChange={(e) => handleStatusChangeRequest(e.target.value)}
                  disabled={changingStatus}
                  /* Touch target mínimo 44px height */
                  className={`appearance-none px-3 py-2.5 sm:py-1.5 rounded-full text-sm font-semibold cursor-pointer border-0 focus:ring-2 focus:ring-secondary w-full sm:w-auto text-left min-h-11 flex items-center ${statusConfig.bgColor} ${statusConfig.textColor}`}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-center py-2">
                      {opt.label}
                    </option>
                  ))}
                </select>
                {changingStatus && (
                  <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2">
                    <Loader2 size={18} className="animate-spin text-secondary" />
                  </div>
                )}
              </div>
            ) : (
              <span className={`px-3 py-2 sm:py-0.5 rounded-full text-sm font-semibold min-h-11 flex items-center ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                {statusConfig.label}
              </span>
            )}

            {/* Botón expandir - Touch target 44x44px */}
            <Button
              onClick={() => setExpanded(!expanded)}
              className="rounded-xl shrink-0"
              aria-expanded={expanded}
              aria-label={expanded ? "Contraer detalles" : "Expandir detalles"}
              variant="ghost"
              size="icon"
            >
              {expanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
            </Button>
          </div>
        </div>

        {/* Vista Expandida: Información organizada por prioridad */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 animate-in slide-in-from-top-2 duration-200">
            {/* Grid responsivo */}
            <div className="grid grid-cols-1 gap-3">
              {/* Credenciales - Información primaria */}
              <div className="space-y-2">
                {sub.clientEmail && (
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 px-3 py-2.5 rounded-lg border border-gray-100 dark:border-slate-700 min-h-11">
                    <span className="text-sm text-gray-600 dark:text-slate-300 truncate mr-2">
                      {sub.clientEmail}
                    </span>
                    <Button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(sub.clientEmail);
                          toast.success("Copiado");
                          if (onCopy) onCopy(sub.clientEmail);
                        } catch {
                          toast.error("Error");
                        }
                      }}
                      className="text-gray-400 hover:text-secondary shrink-0 h-9 w-9"
                      variant="ghost"
                      size="icon"
                      aria-label="Copiar email"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                )}
                {sub.passwordSub && (
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 px-3 py-2.5 rounded-lg border border-gray-100 dark:border-slate-700 min-h-11">
                    <span className="text-sm font-mono text-gray-500">••••••••</span>
                    <Button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(sub.passwordSub);
                          toast.success("Copiado");
                          if (onCopy) onCopy(sub.passwordSub);
                        } catch {
                          toast.error("Error");
                        }
                      }}
                      className="text-gray-400 hover:text-secondary shrink-0 h-9 w-9"
                      variant="ghost"
                      size="icon"
                      aria-label="Copiar contraseña"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                )}
                {sub.kitNumber && (
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 px-3 py-2.5 rounded-lg border border-gray-100 dark:border-slate-700 min-h-11">
                    <span className="text-sm text-gray-600 dark:text-slate-300">
                      KIT: <span className="font-mono font-semibold">{sub.kitNumber}</span>
                    </span>
                    <Button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(sub.kitNumber);
                          toast.success("Copiado");
                          if (onCopy) onCopy(sub.kitNumber);
                        } catch {
                          toast.error("Error");
                        }
                      }}
                      className="text-gray-400 hover:text-secondary shrink-0 h-9 w-9"
                      variant="ghost"
                      size="icon"
                      aria-label="Copiar kit"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                )}
                {sub.country && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary font-medium text-xs">
                      {sub.country}
                    </span>
                  </div>
                )}
              </div>

              {/* Info Financiera y Fecha de Corte */}
              <div className="flex gap-2 p-3 bg-slate-50/50 dark:bg-slate-900/20 rounded-lg border border-gray-100 dark:border-slate-700">
                <div className="flex-1 flex flex-col items-center border-r border-gray-200 dark:border-slate-600">
                  <span className="text-xs uppercase text-gray-400 font-medium mb-0.5">Monto</span>
                  <span className="text-base font-bold text-gray-700 dark:text-gray-200">{sub.amount}</span>
                </div>
                <div className={`flex-1 flex flex-col items-center rounded-lg p-1 ${cutDateStatus.bg}`}>
                  <span className={`text-xs uppercase font-medium mb-0.5 flex items-center gap-1 ${cutDateStatus.color}`}>
                    {cutDateStatus.icon && <cutDateStatus.icon size={12} />}
                    {cutDateStatus.label}
                  </span>
                  <span className={`text-base font-bold ${cutDateStatus.color}`}>{sub.cutDate}</span>
                </div>
              </div>
            </div>

            {/* Acciones - Botones más sutiles */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
              <Button
                onClick={() => onEdit(sub)}
                className="flex-1 h-11"
                variant="secondary"
              >
                <Pencil size={16} />
                <span className="ml-1.5 text-sm font-medium">Editar</span>
              </Button>
              <Button
                onClick={() => onDelete(sub.id ?? sub.clientId)}
                className="flex-1 h-11"
                variant="ghost"
              >
                <Trash2 size={16} />
                <span className="ml-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">Eliminar</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación - Mobile-First: Bottom Sheet en móvil */}
      {showConfirmModal && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowConfirmModal(false)}
            aria-hidden="true"
          />
          {/* Mobile: Bottom Sheet, Desktop: Modal centrado */}
          <div className="fixed z-50 bottom-0 left-0 right-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-sm w-full sm:w-auto animate-in slide-in-from-bottom-10 sm:slide-in-from-top-10 duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl border-t sm:border border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                  <Trash2 size={20} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Confirmar cambio
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Status: {STATUS_CONFIG[pendingStatus]?.label || pendingStatus}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                ¿Cambiar el status de esta suscripción?
              </p>
              {/* Botones con spacing adecuado */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 h-11 text-sm font-medium"
                  variant="outline"
                  disabled={changingStatus}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleStatusChange}
                  disabled={changingStatus}
                  className="flex-1 h-11 text-sm font-medium flex items-center justify-center gap-1.5"
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
