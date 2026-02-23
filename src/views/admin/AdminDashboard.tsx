import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { clientsApi, subscriptionsApi, communicationsApi } from "../../api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    clients: 0,
    subscriptions: 0,
    revenue: 0,
    unread: 0,
  });
  const [loading, setLoading] = useState(true);

  const [clientsList, setClientsList] = useState<any[]>([]);
  const [subsList, setSubsList] = useState<any[]>([]);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientsRes, subsRes, commsRes] = await Promise.all([
          clientsApi.list(),
          subscriptionsApi.list(),
          communicationsApi.listConversations(),
        ]);

        // Clients
        const clients = Array.isArray(clientsRes.data)
          ? clientsRes.data
          : clientsRes.data?.data || [];
        setClientsList(clients);
        // Subscriptions
        const subs = Array.isArray(subsRes.data)
          ? subsRes.data
          : subsRes.data?.data || [];
        setSubsList(subs);
        // Calculate revenue
        const revenue = subs.reduce((acc: number, sub: any) => {
          if (!sub.amount) return acc;
          const clean = sub.amount.replace(/[^0-9]/g, "");
          return acc + (parseInt(clean) || 0);
        }, 0);
        // Unread messages
        // @ts-ignore
        const commsList: any[] = Array.isArray(commsRes.data)
          ? commsRes.data
          : commsRes.data?.data || [];
        const unread = commsList.reduce(
          (acc, curr) => acc + (curr.unreadCount || 0),
          0,
        );
        setStats({
          clients: clients.length,
          subscriptions: subs.length,
          revenue,
          unread,
        });
      } catch (e) {
        console.error("Error loading dashboard stats", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray dark:text-white tracking-tight">
            Panel de Control
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Resumen y accesos directos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-2 gap-6 md:auto-rows-fr">
        <Card
          title="Suscripciones"
          className="h-full md:col-span-2 2xl:col-span-2 hover:shadow-lg transition-all duration-200"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            Controla los planes activos, fechas de corte y facturación mensual.
          </p>
          {/* Próximas suscripciones a vencer */}
          {subsList.length > 0 &&
            (() => {
              const upcomingSubs = subsList.filter((sub) => {
                if (!sub.cutDate) return false;
                const cut = new Date(sub.cutDate);
                const now = new Date();
                const diff = Math.ceil(
                  (cut.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
                );
                return diff >= 0 && diff <= 7;
              });
              if (upcomingSubs.length === 0) return null;
              // Helper para mostrar fecha en formato '26 de Febrero'
              const formatDate = (dateStr: string) => {
                const date = new Date(dateStr);
                const meses = [
                  "Enero",
                  "Febrero",
                  "Marzo",
                  "Abril",
                  "Mayo",
                  "Junio",
                  "Julio",
                  "Agosto",
                  "Septiembre",
                  "Octubre",
                  "Noviembre",
                  "Diciembre",
                ];
                return `${date.getDate()} de ${meses[date.getMonth()]}`;
              };
              return (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-5 h-5 text-primary dark:text-slate-200 animate-pulse"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-semibold text-primary dark:text-slate-200">
                      Suscripciones por vencer esta semana
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {upcomingSubs.map((sub) => {
                      const client = clientsList.find(
                        (c) => c.uid === sub.clientId || c.id === sub.clientId,
                      );
                      const cut = new Date(sub.cutDate);
                      const now = new Date();
                      const diff = Math.ceil(
                        (cut.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
                      );
                      return (
                        <div
                          key={sub.id ?? sub.clientId}
                          className="flex items-center gap-2 md:gap-4 p-3 rounded-xl border border-secondary dark:border-secondary bg-secondary/50 dark:bg-secondary/40 shadow-sm"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-gray dark:text-primary text-sm px-2 py-1 rounded bg-secondary dark:bg-secondary uppercase">
                              {client?.name || "Cliente desconocido"}
                            </span>
                          </div>
                          <div className="flex-1 text-center">
                            <span className="inline-block text-xs font-semibold px-2 py-1 rounded bg-secondary dark:bg-secondary text-primary dark:text-primary">
                              {diff === 0 ? (
                                <span>¡Vence hoy!</span>
                              ) : (
                                <span>
                                  Faltan{" "}
                                  <b className="text-primary dark:text-primary">
                                    {diff}
                                  </b>{" "}
                                  día{diff > 1 ? "s" : ""} para vencer el{" "}
                                  <b>{formatDate(sub.cutDate)}</b>
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          <div className="flex justify-end mt-auto">
            <Link to="/admin/subscriptions" className="w-full">
              <Button
                variant="secondary"
                className="w-full justify-between group"
              >
                <span>Ver Suscripciones</span>
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Button>
            </Link>
          </div>
        </Card>

        <Card
          title="Estadísticas Rápidas"
          className="h-full hover:shadow-lg transition-all duration bg-primary/5 dark:bg-slate-800/80 dark:border-primary/30 border-primary/20"
        >
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Clientes Totales
                </span>
                <span className="text-xl font-bold text-gray dark:text-white">
                  {stats.clients}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Suscripciones
                </span>
                <span className="text-xl font-bold text-gray dark:text-white">
                  {stats.subscriptions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Ingresos Mensuales
                </span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(stats.revenue)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-primary/10 dark:border-primary/20 pt-3 mt-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Mensajes sin leer
                </span>
                <span
                  className={`text-sm font-bold px-2 py-0.5 rounded-full ${stats.unread > 0 ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red dark:border-red-800" : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 border border-gray dark:border-slate-600"}`}
                >
                  {stats.unread}
                </span>
              </div>
            </div>
          )}
        </Card>

        <Card
          title="Gestión de Clientes"
          className="h-full hover:shadow-lg transition-all duration-200"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            Administra la base de datos de usuarios, sus datos de contacto y
            estado.
          </p>

          <div className="flex justify-end mt-auto">
            <Link to="/admin/clients" className="w-full">
              <Button className="w-full justify-between group">
                <span>Ver Clientes</span>
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
