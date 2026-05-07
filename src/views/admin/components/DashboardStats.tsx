import React from "react";

type Stats = {
  clients: number;
  subscriptions: number;
  revenue: number;
  unread: number;
};

type Props = {
  stats: Stats;
  loading: boolean;
  formatCurrency: (n: number) => string;
};

export default function DashboardStats({ stats, loading, formatCurrency }: Props) {
  return (
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
            <span className={`text-2xl font-bold ${stats.unread > 0 ? "text-red-700 dark:text-red-300" : " text-slate-500 dark:text-slate-300"}`}>
              {stats.unread}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
