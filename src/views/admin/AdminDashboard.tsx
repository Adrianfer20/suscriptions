
import { Card } from "../../components/ui/Card";
import PageHeader from '../../components/layout/PageHeader'
import useAdminDashboard from "./hooks/useAdminDashboard";
import DashboardStats from "./components/DashboardStats";
import SubscriptionsPanel from "./components/SubscriptionsPanel";

export default function AdminDashboard() {
  const { stats, loading, clientsList, subsList } = useAdminDashboard();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Panel de Control" subtitle="Resumen y accesos directos." />

      <DashboardStats stats={stats} loading={loading} formatCurrency={formatCurrency} />

      <div className="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-1 gap-6">
        <Card title="Suscripciones" className="hover:shadow-lg transition-all duration-200">
          <SubscriptionsPanel subsList={subsList} clientsList={clientsList} />
        </Card>
      </div>
    </div>
  );
}
