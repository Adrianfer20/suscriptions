import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import PageHeader from '../../components/layout/PageHeader'
import { clientsApi, subscriptionsApi, communicationsApi } from "../../services/api";
import { formatDate } from "../../utils/date";

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
          // Ensure amount is string before cleaning non-numeric characters
          const clean = String(sub.amount).replace(/[^0-9]/g, "");
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
      <PageHeader title="Panel de Control" subtitle="Resumen y accesos directos." />

      {/* Estadísticas Rápidas - Strip at the top */}
      <div className="bg-primary/5 dark:bg-slate-800/80 border border-primary/20 dark:border-primary/30 rounded-xl p-4">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">
          Estadísticas Rápidas
        </h2>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-3 bg-white dark:bg-slate-700/50 rounded-lg shadow-sm">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Clientes</span>
              <span className="text-2xl font-bold text-slate-700 dark:text-white">{stats.clients}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-white dark:bg-slate-700/50 rounded-lg shadow-sm">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Suscripciones</span>
              <span className="text-2xl font-bold text-slate-700 dark:text-white">{stats.subscriptions}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-white dark:bg-slate-700/50 rounded-lg shadow-sm">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Ingresos Mens.</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.revenue)}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-white dark:bg-slate-700/50 rounded-lg shadow-sm">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Mensajes</span>
              <span className={`text-2xl font-bold px-3 py-1 rounded-full ${stats.unread > 0 ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : "bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300"}`}>
                {stats.unread}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-1 gap-6">
        <Card
          title="Suscripciones"
          className="hover:shadow-lg transition-all duration-200"
        >
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
            Controla los planes activos, fechas de corte y facturación mensual.
          </p>
          {/* Próximas suscripciones a vencer */}
          {subsList.length > 0 &&
            (() => {
              // Filter out paused/suspended subscriptions
              const activeSubs = subsList.filter((sub) => {
                const status = sub.status?.toLowerCase();
                return status !== 'pausada' && status !== 'suspendida' && status !== 'paused' && status !== 'suspended';
              });
              
              const upcomingSubs = activeSubs.filter((sub) => {
                if (!sub.cutDate) return false;
                // Usar timezone de Caracas (UTC-4)
                const CARACAS_OFFSET_HOURS = -4;
                const now = new Date();
                const nowInCaracas = new Date(now.getTime() + CARACAS_OFFSET_HOURS * 60 * 60 * 1000);
                const [year, month, day] = sub.cutDate.split('-').map(Number);
                const cutDateOnly = new Date(year, month - 1, day);
                const todayDate = new Date(nowInCaracas.getFullYear(), nowInCaracas.getMonth(), nowInCaracas.getDate());
                const diff = Math.floor(
                  (cutDateOnly.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24),
                );
                return diff >= 0 && diff <= 7;
              }).sort((a, b) => {
                // Ordenar por fecha de vencimiento más próxima primero
                const [yearA, monthA, dayA] = a.cutDate.split('-').map(Number);
                const [yearB, monthB, dayB] = b.cutDate.split('-').map(Number);
                const dateA = new Date(yearA, monthA - 1, dayA);
                const dateB = new Date(yearB, monthB - 1, dayB);
                return dateA.getTime() - dateB.getTime();
              });
              
              // Filter out paused/suspended subscriptions for overdue list
              const overdueSubs = subsList.filter((sub) => {
                const status = sub.status?.toLowerCase();
                if (status === 'pausada' || status === 'suspendida' || status === 'paused' || status === 'suspended') {
                  return false;
                }
                if (!sub.cutDate) return false;
                const CARACAS_OFFSET_HOURS = -4;
                const now = new Date();
                const nowInCaracas = new Date(now.getTime() + CARACAS_OFFSET_HOURS * 60 * 60 * 1000);
                const [year, month, day] = sub.cutDate.split('-').map(Number);
                const cutDateOnly = new Date(year, month - 1, day);
                const todayDate = new Date(nowInCaracas.getFullYear(), nowInCaracas.getMonth(), nowInCaracas.getDate());
                const diff = Math.floor(
                  (cutDateOnly.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24),
                );
                return diff < 0; // Already passed the cut date
              }).sort((a, b) => {
                // Ordenar por fecha de vencimiento más antigua primero
                const [yearA, monthA, dayA] = a.cutDate.split('-').map(Number);
                const [yearB, monthB, dayB] = b.cutDate.split('-').map(Number);
                const dateA = new Date(yearA, monthA - 1, dayA);
                const dateB = new Date(yearB, monthB - 1, dayB);
                return dateA.getTime() - dateB.getTime();
              });
              
              if (upcomingSubs.length === 0 && overdueSubs.length === 0) return null;
              return (
                <div className="space-y-4">
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
                      // Usar timezone de Caracas (UTC-4)
                      const CARACAS_OFFSET_HOURS = -4;
                      const now = new Date();
                      const nowInCaracas = new Date(now.getTime() + CARACAS_OFFSET_HOURS * 60 * 60 * 1000);
                      const [year, month, day] = sub.cutDate.split('-').map(Number);
                      const cutDateOnly = new Date(year, month - 1, day);
                      const todayDate = new Date(nowInCaracas.getFullYear(), nowInCaracas.getMonth(), nowInCaracas.getDate());
                      const diff = Math.floor(
                        (cutDateOnly.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24),
                      );
                      return (
                        <div
                          key={sub.id ?? sub.clientId}
                          className="flex items-center gap-2 md:gap-4 p-3 rounded-xl border border-secondary dark:border-secondary bg-secondary/50 shadow-sm"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-slate dark:text-primary text-sm px-2 py-1 rounded bg-secondary uppercase">
                              {client?.name || "Cliente desconocido"}
                            </span>
                          </div>
                          <div className="flex-1 text-center">
                            <span className="inline-block text-xs font-semibold px-2 py-1 rounded bg-secondary text-primary dark:text-primary">
                              {diff === 0 ? (
                                <span>¡Vence hoy!</span>
                              ) : (
                                <span>
                                  Faltan{" "}
                                  <b className="text-primary">
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

                  {overdueSubs.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2 mb-2">
                        <svg
                          className="w-5 h-5 text-red-500 dark:text-red-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          Suscripciones vencidas
                        </span>
                      </div>

                      <div className="flex flex-col gap-3">
                        {overdueSubs.map((sub) => {
                          const client = clientsList.find(
                            (c) => c.uid === sub.clientId || c.id === sub.clientId,
                          );
                          const CARACAS_OFFSET_HOURS = -4;
                          const now = new Date();
                          const nowInCaracas = new Date(now.getTime() + CARACAS_OFFSET_HOURS * 60 * 60 * 1000);
                          const [year, month, day] = sub.cutDate.split('-').map(Number);
                          const cutDateOnly = new Date(year, month - 1, day);
                          const todayDate = new Date(nowInCaracas.getFullYear(), nowInCaracas.getMonth(), nowInCaracas.getDate());
                          const diff = Math.floor(
                            (todayDate.getTime() - cutDateOnly.getTime()) / (1000 * 60 * 60 * 24),
                          );
                          return (
                            <div
                              key={sub.id ?? sub.clientId}
                              className="flex items-center gap-2 md:gap-4 p-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 shadow-sm"
                            >
                              <div className="flex flex-col">
                                <span className="font-bold text-slate dark:text-primary text-sm px-2 py-1 rounded bg-secondary uppercase">
                                  {client?.name || "Cliente desconocido"}
                                </span>
                              </div>
                              <div className="flex-1 text-center">
                                <span className="inline-block text-xs font-semibold px-2 py-1 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                                  <span>
                                    Venció hace{" "}
                                    <b className="text-red-600 dark:text-red-400">
                                      {diff}
                                    </b>{" "}
                                    día{diff > 1 ? "s" : ""} el{" "}
                                    <b>{formatDate(sub.cutDate)}</b>
                                  </span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          <div className="flex justify-end mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
            <Link to="/admin/subscriptions" className="w-full">
              <Button
                variant="secondary"
                className="w-full justify-between group"
              >
                <span>Ver Suscripciones</span>
                <svg
                  className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:translate-x-1 transition-transform"
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
