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
    <Card title={`Suscripciones (${filteredItems.length}${searchQuery || statusFilter ? ` / ${itemsCount}` : ''})`} className="h-full">
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center p-12">
          <div className="bg-gray-100 dark:bg-slate-700/50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <CreditCard size={32} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No se encontraron suscripciones</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery || statusFilter ? "Intenta con otros filtros de búsqueda" : "Crea una nueva suscripción para comenzar."}
          </p>
          {(searchQuery || statusFilter) ? (
            <Button onClick={onClearFilters} variant="outline">Limpiar filtros</Button>
          ) : (
            <Button onClick={onToggleCutDateSort ?? onCreateFirst} variant="primary">
              {cutDateSort === "asc" ? "Ordenar por corte: Inicio → Fin" : cutDateSort === "desc" ? "Ordenar por corte: Fin → Inicio" : "Ordenar por fecha de corte"}
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-2 sm:p-0 max-w-full">
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
