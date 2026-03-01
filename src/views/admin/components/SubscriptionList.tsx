import React from "react";
import { Card } from "../../../components/ui/Card";
import { Button } from '../../../components/ui/Button'
import { CreditCard } from "lucide-react";
import SubscriptionItem from "./SubscriptionItem";
import { SubscriptionWithEmail } from "../hooks/useAdminSubscriptions";
import { Client } from "../../../services/api";

type Props = {
  filteredItems: SubscriptionWithEmail[];
  itemsCount: number;
  clients: Client[];
  loading: boolean;
  searchQuery: string;
  statusFilter: string;
  onClearFilters: () => void;
  onCreateFirst: () => void;
  cutDateSort?: "asc" | "desc" | null;
  onToggleCutDateSort?: () => void;
  onEdit: (s: SubscriptionWithEmail) => void;
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
  PLAN_LABELS: Record<string, string>;
  isAdmin: boolean;
  onStatusChange: (id: string, status: string) => void;
};

export default function SubscriptionList({
  filteredItems,
  itemsCount,
  clients,
  loading,
  searchQuery,
  statusFilter,
  cutDateSort,
  onToggleCutDateSort,
  onClearFilters,
  onCreateFirst,
  onEdit,
  onDelete,
  onCopy,
  PLAN_LABELS,
  isAdmin,
  onStatusChange,
}: Props) {
  return (
    <Card className="h-full min-h-[50vh] sm:min-h-0">
      {/* Mobile-First: Título más legible en móvil */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-base font-bold text-gray-900 dark:text-white">
          Suscripciones ({filteredItems.length}{searchQuery || statusFilter ? ` / ${itemsCount}` : ''})
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 sm:py-8">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 sm:py-8 px-4">
          <div className="bg-gray-100 dark:bg-slate-700/50 rounded-full h-20 w-20 sm:h-16 sm:w-16 flex items-center justify-center mx-auto mb-4">
            <CreditCard size={36} className="text-gray-400 dark:text-gray-500 sm:32" />
          </div>
          <h3 className="text-xl sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No se encontraron suscripciones
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-base sm:text-sm">
            {searchQuery || statusFilter 
              ? "Intenta con otros filtros de búsqueda" 
              : "Crea una nueva suscripción para comenzar."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {(searchQuery || statusFilter) ? (
              <Button onClick={onClearFilters} variant="outline" className="w-full sm:w-auto h-12">
                Limpiar filtros
              </Button>
            ) : (
              <Button onClick={onToggleCutDateSort ?? onCreateFirst} variant="primary" className="w-full sm:w-auto h-12">
                {cutDateSort === "asc" 
                  ? "Ordenar: Inicio → Fin" 
                  : cutDateSort === "desc" 
                    ? "Ordenar: Fin → Inicio" 
                    : "Ordenar por fecha de corte"}
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Mobile-First: Gap más comfortable en móvil */
        <div className="flex flex-col gap-3 sm:gap-2 -mx-2 sm:mx-0 px-2 sm:px-0">
          {filteredItems.map((sub) => {
            const client = clients.find((c) => c.uid === sub.clientId || c.id === sub.clientId);
            return (
              <SubscriptionItem
                key={sub.id ?? sub.clientId}
                sub={sub}
                client={client}
                onEdit={() => onEdit(sub)}
                onDelete={onDelete}
                onCopy={onCopy}
                PLAN_LABELS={PLAN_LABELS}
                isAdmin={isAdmin}
                onStatusChange={onStatusChange}
              />
            );
          })}
        </div>
      )}
    </Card>
  );
}
