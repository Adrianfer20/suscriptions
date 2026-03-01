
import { Plus, ChevronUp} from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import SubscriptionForm from "./components/SubscriptionForm";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import useAdminSubscriptions from "./hooks/useAdminSubscriptions";
import SubscriptionList from "./components/SubscriptionList";
import SubscriptionsToolbar from "./components/SubscriptionsToolbar";

export default function AdminSubscriptions() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const {
    clients,
    loading,
    creating,
    isFormOpen,
    setIsFormOpen,
    editingId,
    form,
    setForm,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    filteredItems,
    items,
    PLAN_LABELS,
    handleEdit,
    handleCancelEdit,
    handleCreate,
    handleDelete,
    handleCopy,
    handleStatusChange,
    cutDateSort,
    toggleCutDateSort,
  } = useAdminSubscriptions() as any;

  return (
    <div className="space-y-6">
      {/* Notifications handled with react-hot-toast */}
      <PageHeader
        title="Suscripciones"
        subtitle="Gestiona los planes y cobros de los clientes"
        action={
          <Button
            onClick={() => {
              if (isFormOpen && editingId) handleCancelEdit();
              else setIsFormOpen(!isFormOpen);
            }}
            className="flex items-center gap-2"
            variant={isFormOpen ? "outline" : theme === 'dark' ? 'secondary' : 'primary'}
          >
            {isFormOpen ? <ChevronUp size={18} /> : <Plus size={18} />}
            {isFormOpen ? (editingId ? "Cancelar Edición" : "Cancelar") : "Nueva Suscripción"}
          </Button>
        }
      />

      {isFormOpen && (
        <div id="subscription-form">
          <SubscriptionForm
            form={form}
            setForm={setForm}
            clients={clients}
            onCancel={handleCancelEdit}
            onSubmit={handleCreate}
            creating={creating}
            editingId={editingId}
          />
        </div>
      )}

      <SubscriptionsToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        setIsFormOpen={setIsFormOpen}
        cutDateSort={cutDateSort}
        onToggleCutDateSort={toggleCutDateSort}
      />

      <SubscriptionList
        filteredItems={filteredItems}
        itemsCount={items?.length ?? 0}
        clients={clients}
        loading={loading}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onClearFilters={() => { setSearchQuery(""); setStatusFilter(""); }}
        onCreateFirst={() => setIsFormOpen(true)}
        cutDateSort={cutDateSort}
        onToggleCutDateSort={toggleCutDateSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCopy={handleCopy}
        PLAN_LABELS={PLAN_LABELS}
        isAdmin={user?.role === "admin"}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
