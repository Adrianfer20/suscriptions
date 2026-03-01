import React from "react";
import { Search, Filter, X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from '../../../components/ui/Button'

type Props = {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  setIsFormOpen: (v: boolean) => void;
  cutDateSort?: "asc" | "desc" | null;
  onToggleCutDateSort?: () => void;
};

export default function SubscriptionsToolbar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  setIsFormOpen,
  cutDateSort,
  onToggleCutDateSort,
}: Props) {
  return (
    <div className="flex flex-col gap-3 mb-4 sm:mb-6">
      {/* Mobile-First: Search bar siempre visible y grande */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          inputMode="search"
          aria-label="Buscar suscripciones"
          placeholder="Buscar por cliente..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          /* Mobile-First: Input más grande y con mejor spacing */
          className="w-full pl-12 pr-12 py-3.5 sm:py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base sm:text-sm"
        />
        {searchQuery && (
          <Button
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 h-10 w-10"
            aria-label="Limpiar búsqueda"
            variant="ghost"
            size="icon"
          >
            <X size={18} />
          </Button>
        )}
      </div>

      {/* Filtros - Mobile: scroll horizontal, Desktop: wrapping */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
        {/* Select de estado - Touch target grande */}
        <div className="relative flex-none">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <label className="sr-only" htmlFor="status-filter">Filtrar por estado</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            /* Mobile-First: Select más alto para mejor touch */
            className="pl-10 pr-10 py-3 sm:py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none min-w-11 sm:min-w-40 text-base sm:text-sm"
          >
            <option value="">Todos</option>
            <option value="active">Activa</option>
            <option value="about_to_expire">Por Vencer</option>
            <option value="suspended">Suspendida</option>
            <option value="paused">Pausada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        {onToggleCutDateSort && (
          <Button
            onClick={onToggleCutDateSort}
            title={cutDateSort === "asc" ? "Orden: Corte Inicio → Fin" : cutDateSort === "desc" ? "Orden: Corte Fin → Inicio" : "Ordenar por fecha de corte"}
            /* Mobile-First: Botón de toggle con touch target adecuado */
            className="flex-none h-11 px-4 flex items-center gap-2"
            aria-label="Alternar orden por fecha de corte"
            variant="outline"
          >
            {cutDateSort === "asc" ? <ChevronUp size={18} /> : cutDateSort === "desc" ? <ChevronDown size={18} /> : <ChevronUp size={18} className="opacity-50" />}
            <span className="hidden sm:inline text-sm font-medium">Fecha corte</span>
          </Button>
        )}
      </div>
    </div>
  );
}
