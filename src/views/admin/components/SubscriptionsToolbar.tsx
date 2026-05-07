import React, { useEffect, useState } from "react";
import { Search, Filter, X, ChevronUp, ChevronDown, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const CUT_DATE_FILTERS = [
  { value: "", label: "Todas las fechas" },
  { value: "overdue", label: "Vencidas", icon: AlertCircle, color: "text-red-500" },
  { value: "soon", label: "Por vencer (7d)", icon: Clock, color: "text-orange-500" },
  { value: "ok", label: "Activas (>7d)", icon: CheckCircle, color: "text-green-500" },
];

type Props = {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  setIsFormOpen?: (v: boolean) => void;
  cutDateSort?: "asc" | "desc" | null;
  onToggleCutDateSort?: () => void;
  cutDateFilter?: string;
  setCutDateFilter?: (v: string) => void;
};

export default function SubscriptionsToolbar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  cutDateSort,
  onToggleCutDateSort,
  cutDateFilter = "",
  setCutDateFilter,
}: Props) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const id = setTimeout(() => setSearchQuery(localSearch), 300);
    return () => clearTimeout(id);
  }, [localSearch, setSearchQuery]);

  // Clase base para los selects para evitar repetición
  const selectClasses = `
    h-11 w-full text-sm rounded-xl border appearance-none transition-all
    bg-white dark:bg-slate-800 
    border-slate-200 dark:border-slate-700
    text-slate-900 dark:text-slate-100
    focus:outline-none focus:ring-2 
    focus:ring-blue-500 dark:focus:ring-blue-400 
    focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900
  `;

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* 1. Buscador - Full width siempre */}
      <div className="w-full">
        <Input
          type="text"
          inputMode="search"
          placeholder="Buscar cliente..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          variant="search"
          className="w-full"
          startContent={<Search size={18} className="text-slate-400" />}
          endContent={localSearch ? (
            <button onClick={() => { setLocalSearch(""); setSearchQuery(""); }}>
              <X size={16} className="text-slate-400 hover:text-slate-600" />
            </button>
          ) : undefined}
        />
      </div>

      {/* 2. Contenedor de Filtros - Grid 2 columnas en mobile */}
      <div className="grid grid-cols-2 md:flex md:flex-row items-center gap-3">
        
        {/* Filtro Status */}
        <div className="relative group">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${selectClasses} pl-10 pr-4`}
          >
            <option value="">Status: Todos</option>
            <option value="active">Activa</option>
            <option value="about_to_expire">Por Vencer</option>
            <option value="suspended">Suspendida</option>
            <option value="paused">Pausada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        {/* Filtro Fecha de Corte */}
        {setCutDateFilter && (
          <div className="relative">
            <select
              value={cutDateFilter}
              onChange={(e) => setCutDateFilter(e.target.value)}
              className={`${selectClasses} px-4`}
            >
              {CUT_DATE_FILTERS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Botón Orden - Ocupa 2 columnas en pantallas muy pequeñas si quieres, o sigue el flujo */}
        {onToggleCutDateSort && (
          <Button
            onClick={onToggleCutDateSort}
            variant="secondary"
            className="col-span-2 md:col-span-1 h-11 flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            {cutDateSort === "asc" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            <span className="text-sm font-semibold">
                {cutDateSort ? (cutDateSort === 'asc' ? 'Antiguos' : 'Recientes') : 'Ordenar'}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
