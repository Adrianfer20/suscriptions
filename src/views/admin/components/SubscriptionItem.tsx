import React, { useState } from "react";
import { Copy, Pencil, Trash2, CheckCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { subscriptionsApi } from "../../../services/api";
import toast from "react-hot-toast";
import { Button } from '../../../components/ui/Button'

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

  return (
    <>
      <div className="group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-3 sm:p-4 hover:shadow-xl hover:border-secondary/20 transition-all duration-300 w-full overflow-hidden">
        {/* Vista Compacta: diseño móvil-primero (columna), en pantallas >=sm fila */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Nombre de la suscripción */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-secondary font-bold text-lg border border-slate-200 dark:border-slate-600 shrink-0">
              {client?.name?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">
                {client?.name || "Cliente desconocido"}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-medium text-secondary">{PLAN_LABELS[sub.plan] || sub.plan}</span>
                <span className="text-xs text-gray-500 uppercase">Corte: {sub.cutDate || "—"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            {/* Status Badge o Select (solo admin) */}
            {isAdmin ? (
              <div className="relative w-full sm:w-auto">
                <select
                  value={currentStatus}
                  onChange={(e) => handleStatusChangeRequest(e.target.value)}
                  disabled={changingStatus}
                  className={`appearance-none px-2 py-1.5 rounded-full text-xs font-medium cursor-pointer border-0 focus:ring-2 focus:ring-secondary w-full sm:w-auto text-left ${statusConfig.bgColor} ${statusConfig.textColor}`}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-center">
                      {opt.label}
                    </option>
                  ))}
                </select>
                {changingStatus && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Loader2 size={14} className="animate-spin text-secondary" />
                  </div>
                )}
              </div>
            ) : (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                {statusConfig.label}
              </span>
            )}

            {/* Botón Mostrar más */}
            <Button
              onClick={() => setExpanded(!expanded)}
              className="rounded-xl"
              aria-expanded={expanded}
              variant="ghost"
              size="icon"
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </Button>
          </div>
        </div>

        {/* Vista Expandida: Más información */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Credenciales */}
              <div className="space-y-2">
                {sub.clientEmail && (
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 px-3 py-2 rounded-xl border border-gray-100 dark:border-slate-700 group/copy">
                    <span className="text-xs text-gray-500 dark:text-slate-400 truncate mr-2 wrap-break-word">
                      {sub.clientEmail}
                    </span>
                    <Button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(sub.clientEmail);
                          toast.success("Copiado al portapapeles");
                          if (onCopy) onCopy(sub.clientEmail);
                        } catch {
                          toast.error("No se pudo copiar");
                        }
                      }}
                      className="text-gray-400 hover:text-secondary transition-all active:scale-90"
                      variant="ghost"
                      size="icon"
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                )}
                {sub.passwordSub && (
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 px-3 py-2 rounded-xl border border-gray-100 dark:border-slate-700">
                    <span className="text-xs font-mono text-gray-400 tracking-widest">••••••••</span>
                    <Button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(sub.passwordSub);
                          toast.success("Copiado al portapapeles");
                          if (onCopy) onCopy(sub.passwordSub);
                        } catch {
                          toast.error("No se pudo copiar");
                        }
                      }}
                      className="text-gray-400 hover:text-secondary transition-all active:scale-90"
                      variant="ghost"
                      size="icon"
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                )}
                {sub.kitNumber && (
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 px-3 py-2 rounded-xl border border-gray-100 dark:border-slate-700">
                    <span className="text-xs text-gray-500 dark:text-slate-400 truncate wrap-break-word">
                      KIT: <span className="font-mono font-bold">{sub.kitNumber}</span>
                    </span>
                    <Button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(sub.kitNumber);
                          toast.success("Copiado al portapapeles");
                          if (onCopy) onCopy(sub.kitNumber);
                        } catch {
                          toast.error("No se pudo copiar");
                        }
                      }}
                      className="text-gray-400 hover:text-secondary transition-all active:scale-90"
                      variant="ghost"
                      size="icon"
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                  <span className="px-1.5 py-0.5 rounded-md bg-secondary/10 text-secondary font-bold uppercase">
                    {sub.country || "—"}
                  </span>
                </div>
              </div>

              {/* Info Financiera / Fechas */}
              <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                
                <div className="flex flex-col items-center justify-center border-r border-gray-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase text-gray-400 font-bold mb-1">Monto</span>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{sub.amount}</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase text-red-400 font-bold mb-1">Corte</span>
                  <span className="text-sm font-black text-red-600 dark:text-red-400">{sub.cutDate}</span>
                </div>
              </div>
            </div>

            {/* Acciones en vista expandida */}
            <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
              <Button
                onClick={() => onEdit(sub)}
                className="w-full sm:flex-1"
                variant="secondary"
              >
                <Pencil size={18} />
                <span className="text-sm font-medium">Editar</span>
              </Button>
              <Button
                onClick={() => onDelete(sub.id ?? sub.clientId)}
                className="w-full sm:flex-1"
                variant="destructive"
              >
                <Trash2 size={18} />
                <span className="text-sm font-medium">Eliminar</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Confirmar cambio de status
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que deseas cambiar el status de esta suscripción a <strong>{STATUS_CONFIG[pendingStatus]?.label || pendingStatus}</strong>?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1"
                variant="outline"
                disabled={changingStatus}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleStatusChange}
                disabled={changingStatus}
                className="flex-1 flex items-center justify-center gap-2"
                variant="secondary"
              >
                {changingStatus && <Loader2 size={16} className="animate-spin" />}
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
