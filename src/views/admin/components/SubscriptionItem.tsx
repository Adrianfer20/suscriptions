import { useState } from "react";
import { 
  Copy, Pencil, Trash2, CheckCircle, ChevronDown, ChevronUp, 
  Loader2, AlertCircle, Clock, RefreshCw, Calendar, 
  DollarSign, MapPin, Hash, Key 
} from "lucide-react";
import { subscriptionsApi } from "../../../services/api";
import toast from "react-hot-toast";
import { Button } from '../../../components/ui/Button';

// --- HELPERS ---

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
  if (days === null) return { label: 'Sin fecha', color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700', icon: null };
  if (days < 0) return { label: `Vencida (${Math.abs(days)}d)`, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: AlertCircle };
  if (days <= 3) return { label: `${days}d restantes`, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', icon: Clock };
  if (days <= 7) return { label: `${days}d por vencer`, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', icon: Clock };
  return { label: `${days}d restantes`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', icon: CheckCircle };
};

const STATUS_CONFIG: Record<string, any> = {
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

const getAvatarGradient = (name: string) => {
  const colors = ["from-violet-500 to-purple-600", "from-blue-500 to-cyan-600", "from-emerald-500 to-teal-600", "from-orange-500 to-amber-600", "from-pink-500 to-rose-600", "from-indigo-500 to-blue-600"];
  const idx = (name || "U").charCodeAt(0) % colors.length;
  return colors[idx];
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
};

// --- SUB-COMPONENT: DETAIL ITEM ---

const DetailTile = ({ icon: Icon, label, value, colorClass = "", bgColor = "bg-slate-50 dark:bg-slate-700/40" }: any) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl border border-transparent transition-colors ${bgColor}`}>
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
      <Icon size={16} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{value}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

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
}: any) {
  const [expanded, setExpanded] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>("");

  const clientName = client?.name || "Cliente desconocido";
  const avatarGradient = getAvatarGradient(clientName);
  const statusConfig = STATUS_CONFIG[sub.status || "active"] || STATUS_CONFIG.active;
  const cutDateStatus = getCutDateStatus(sub.cutDate);
  const planLabel = PLAN_LABELS[sub.plan] || sub.plan || "Sin plan";

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
      await subscriptionsApi.updateStatus(sub.id, pendingStatus as any);
    } catch (error: any) {
      if (onStatusChange) onStatusChange(sub.id, previousStatus);
      toast.error(error?.response?.data?.message || "Error al cambiar el status");
    } finally {
      setChangingStatus(false);
      setPendingStatus("");
    }
  };

  return (
    <>
      <div className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 w-full flex">
        <div className="flex-1 min-w-0">
          <div className="p-4 sm:p-5">
            
            {/* Header: Avatar e Info Principal */}
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${avatarGradient} flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0`}>
                {clientName.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white truncate text-base sm:text-lg leading-tight">
                  {clientName}
                </h3>
                {client?.email && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{client.email}</p>
                )}
              </div>

              <Button
                onClick={() => setExpanded(!expanded)}
                className="rounded-xl shrink-0 h-10 w-10"
                variant="ghost"
                size="icon"
              >
                {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </Button>
            </div>

            {/* Badges y Selector de Estado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                  {planLabel}
                </span>

                {sub.cutDate && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${cutDateStatus.border} ${cutDateStatus.bg} ${cutDateStatus.color}`}>
                    {cutDateStatus.icon && <cutDateStatus.icon size={12} />}
                    {formatDate(sub.cutDate)}
                  </span>
                )}

                {sub.amount && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    <DollarSign size={12} />
                    {sub.amount}
                  </span>
                )}
              </div>

              <div className="w-full sm:w-auto">
                {isAdmin ? (
                  <div className="relative">
                    <select
                      value={sub.status || "active"}
                      onChange={(e) => handleStatusChangeRequest(e.target.value)}
                      disabled={changingStatus}
                      className={`w-full sm:w-auto appearance-none pl-3 pr-9 py-2 rounded-xl text-xs font-bold border transition-all ${statusConfig.border} ${statusConfig.bg} ${statusConfig.color} cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800`}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                    {changingStatus && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-800/60 rounded-xl">
                        <Loader2 size={16} className="animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${statusConfig.border} ${statusConfig.bg} ${statusConfig.color}`}>
                    <span className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse`} />
                    {statusConfig.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Detalles Expandidos */}
          {expanded && (
            <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  {sub.startDate && (
                    <DetailTile icon={Calendar} label="Fecha de Inicio" value={formatDate(sub.startDate)} colorClass="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
                  )}
                  {sub.cutDate && (
                    <DetailTile icon={Clock} label="Estado de Corte" value={cutDateStatus.label} bgColor={cutDateStatus.bg} colorClass={cutDateStatus.color} />
                  )}
                  {sub.country && (
                    <DetailTile icon={MapPin} label="Ubicación/País" value={sub.country} colorClass="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {sub.kitNumber && (
                    <DetailTile icon={Hash} label="Número de Kit" value={sub.kitNumber} colorClass="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" />
                  )}
                  
                  {sub.passwordSub && (
                    <div className="xs:col-span-2 flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                        <Key size={16} className="text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Contraseña del Servicio</p>
                        <p className="text-sm font-mono font-bold text-slate-900 dark:text-white truncate">{sub.passwordSub}</p>
                      </div>
                      <Button onClick={() => onCopy?.(sub.passwordSub)} variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                        <Copy size={16} />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button onClick={() => onEdit(sub)} variant="outline" size="sm" className="h-10 text-xs font-bold">
                    <Pencil size={14} className="mr-2" /> Editar
                  </Button>
                  {onRenew && (
                    <Button onClick={() => onRenew(sub.id)} variant="secondary" size="sm" className="h-10 text-xs font-bold">
                      <RefreshCw size={14} className="mr-2" /> Renovar
                    </Button>
                  )}
                  <div className="hidden sm:block flex-1" />
                  <Button onClick={() => onDelete(sub.id)} variant="danger" size="sm" className="col-span-2 sm:w-auto h-10 text-xs font-bold">
                    <Trash2 size={14} className="mr-2" /> Eliminar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Barra lateral de estado */}
        <div className={`w-1.5 self-stretch bg-linear-to-b ${statusConfig.gradient} opacity-80 shrink-0`} />
      </div>

      {/* Modal de Confirmación Estilo Bottom-Sheet en Mobile */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !changingStatus && setShowConfirmModal(false)} />
          <div className="relative w-full sm:max-w-md bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <AlertCircle size={24} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cambiar Estado</h3>
                <p className="text-sm text-slate-500">
                  ¿Confirmas el cambio a <span className={`font-bold ${STATUS_CONFIG[pendingStatus]?.color}`}>{STATUS_CONFIG[pendingStatus]?.label}</span>?
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setShowConfirmModal(false)} variant="outline" className="flex-1 h-12 sm:h-10 font-bold" disabled={changingStatus}>
                Cancelar
              </Button>
              <Button onClick={handleStatusChange} disabled={changingStatus} className="flex-1 h-12 sm:h-10 font-bold gap-2">
                {changingStatus && <Loader2 size={18} className="animate-spin" />}
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}