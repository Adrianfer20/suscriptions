import React, { useEffect, useState } from "react";
import { Search, Filter, X, ChevronUp, ChevronDown, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { Button } from '../../../components/ui/Button'

// Opciones de filtro por estado de fecha de corte
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
  // Nota: `setIsFormOpen` eliminado porque no se usa en este componente
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

  // Sincroniza cambios externos en `searchQuery`
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounce: notifica cambios al padre tras 300ms de inactividad
  useEffect(() => {
    const id = setTimeout(() => setSearchQuery(localSearch), 300);
    return () => clearTimeout(id);
  }, [localSearch, setSearchQuery]);
  return (
    <div className="flex flex-col md:flex-row gap-3 mb-4 sm:mb-6">
      {/* Mobile-First: Search bar siempre visible y grande */}
      <div className="relative md:flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          inputMode="search"
          aria-label="Buscar suscripciones"
          placeholder="Buscar por cliente..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="h-11 pl-12 pr-12 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full"
        />
        {localSearch && (
          <Button
            onClick={() => {
              setLocalSearch("");
              setSearchQuery("");
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 h-10 w-10"
            aria-label="Limpiar búsqueda"
            variant="ghost"
            size="icon"
          >
            <X size={18} />
          </Button>
        )}
      </div>

      {/* Filtros - Mobile: scroll horizontal */}
      <div className="flex items-center justify-between gap-2">
        {/* Select de estado */}
        <div className="relative flex-none">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <label className="sr-only" htmlFor="status-filter">Filtrar por estado</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 pl-10 pr-5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none min-w-40"
          >
            <option value="">Todos los status</option>
            <option value="active">Activa</option>
            <option value="about_to_expire">Por Vencer</option>
            <option value="suspended">Suspendida</option>
            <option value="paused">Pausada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        {/* Filtro por fecha de corte */}
        {setCutDateFilter && (
          <div className="relative flex-none">
            <label className="sr-only" htmlFor="cutdate-filter">Filtrar por fecha de corte</label>
            <select
              id="cutdate-filter"
              value={cutDateFilter}
              onChange={(e) => setCutDateFilter(e.target.value)}
              className="h-11 pl-4 pr-10 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none min-w-40"
            >
              {CUT_DATE_FILTERS.map((opt) => (
                <option key={opt.value} value={opt.value} className="py-2">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {onToggleCutDateSort && (
          <Button
            onClick={onToggleCutDateSort}
            title={cutDateSort === "asc" ? "Orden: Corte Inicio → Fin" : cutDateSort === "desc" ? "Orden: Corte Fin → Inicio" : "Ordenar por fecha de corte"}
            variant="secondary"
            size="md"
            className="flex-none flex items-center gap-2 rounded-xl"
            aria-label="Alternar orden por fecha de corte"
            aria-pressed={Boolean(cutDateSort)}
          >
            {cutDateSort === "asc" ? <ChevronUp size={18} /> : cutDateSort === "desc" ? <ChevronDown size={18} /> : <ChevronUp size={18}  />}
            <span className="inline text-sm font-medium">Fecha corte</span>
          </Button>
        )}
      </div>
    </div>
  );
}
