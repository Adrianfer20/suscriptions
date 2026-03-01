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
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          inputMode="search"
          aria-label="Buscar suscripciones"
          placeholder="Buscar por nombre del cliente..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {searchQuery && (
          <Button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 h-10 w-10 p-2"
            aria-label="Limpiar búsqueda"
            variant="ghost"
            size="icon"
          >
            <X size={16} />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:flex-none">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <label className="sr-only" htmlFor="status-filter">Filtrar por estado</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none min-w-40 w-full sm:w-auto"
          >
          <option value="">Todos los status</option>
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
            className="ml-2 h-10 w-10 p-2"
            aria-label="Alternar orden por fecha de corte"
            variant="ghost"
            size="icon"
          >
            {cutDateSort === "asc" ? <ChevronUp size={16} /> : cutDateSort === "desc" ? <ChevronDown size={16} /> : <ChevronUp size={16} className="opacity-50" />}
          </Button>
        )}
      </div>
    </div>
  );
}
