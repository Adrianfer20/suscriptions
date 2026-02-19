import React from "react";
import { Copy, Pencil, Trash2, CheckCircle, Calendar, DollarSign } from "lucide-react";

export default function SubscriptionItem({ 
  sub, 
  client, 
  onEdit, 
  onDelete, 
  onCopy, 
  copiedValue,
  PLAN_LABELS 
}: {
  sub: any; // Replace 'any' with the actual type
  client: any; // Replace 'any' with the actual type
  onEdit: (id: string) => void; // Example type, adjust as needed
  onDelete: (id: string) => void; // Example type, adjust as needed
  onCopy: (value: string) => void; // Example type, adjust as needed
  copiedValue: string; // Example type, adjust as needed
  PLAN_LABELS: Record<string, string>; // Example type, adjust as needed
}) {
  return (
    <div className="group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 hover:shadow-xl hover:border-secondary/20 transition-all duration-300">
      <div className="flex flex-col lg:flex-row gap-5 lg:items-center">
        
        {/* CABECERA: Avatar e Identidad (Siempre arriba o a la izquierda) */}
        <div className="flex items-center gap-4 min-w-55">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-secondary font-bold text-lg border border-slate-200 dark:border-slate-600">
              {client?.name?.charAt(0) || "U"}
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-secondary text-[10px] font-bold text-white uppercase shadow-sm">
              {sub.country || "—"}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">
              {client?.name || "Cliente desconocido"}
            </h3>
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              {PLAN_LABELS[sub.plan] || sub.plan}
            </span>
          </div>
        </div>

        {/* CUERPO: Datos y Fechas (Grid que se ajusta) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Credenciales */}
          <div className="space-y-2">
            {sub.clientEmail && (
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 px-3 py-2 rounded-xl border border-gray-100 dark:border-slate-700 group/copy">
                <span className="text-xs text-gray-500 dark:text-slate-400 truncate mr-2">
                  {sub.clientEmail}
                </span>
                <button
                  onClick={() => onCopy(sub.clientEmail)}
                  className="text-gray-400 hover:text-secondary transition-all active:scale-90"
                >
                  {copiedValue === sub.clientEmail ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            )}
            {sub.passwordSub && (
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 px-3 py-2 rounded-xl border border-gray-100 dark:border-slate-700">
                <span className="text-xs font-mono text-gray-400 tracking-widest">••••••••</span>
                <button
                  onClick={() => onCopy(sub.passwordSub)}
                  className="text-gray-400 hover:text-secondary transition-all active:scale-90"
                >
                  {copiedValue === sub.passwordSub ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            )}
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

        {/* ACCIONES (En móvil se ven abajo en fila, en desktop a la derecha) */}
        <div className="flex lg:flex-col gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-slate-700 justify-end">
          <button
            onClick={() => onEdit(sub)}
            className="flex-1 lg:flex-none p-2.5 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-500 hover:bg-secondary hover:text-white transition-all shadow-sm"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => onDelete(sub.id ?? sub.clientId)}
            className="flex-1 lg:flex-none p-2.5 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}