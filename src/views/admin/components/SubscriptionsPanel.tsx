import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { formatDate as defaultFormatDate } from "../../../utils/date";

type Props = {
  subsList: any[];
  clientsList: any[];
  formatDate?: (d: string) => string;
};

const CARACAS_OFFSET_HOURS = -4;

function getNowInCaracas() {
  const now = new Date();
  return new Date(now.getTime() + CARACAS_OFFSET_HOURS * 60 * 60 * 1000);
}

export default function SubscriptionsPanel({ subsList, clientsList, formatDate = defaultFormatDate }: Props) {
  if (!subsList || subsList.length === 0) return null;

  const activeSubs = subsList.filter((sub) => {
    const status = sub.status?.toLowerCase();
    return status !== "pausada" && status !== "suspendida" && status !== "paused" && status !== "suspended";
  });

  const upcomingSubs = activeSubs.filter((sub) => {
    if (!sub.cutDate) return false;
    const nowInCaracas = getNowInCaracas();
    const [year, month, day] = sub.cutDate.split("-").map(Number);
    const cutDateOnly = new Date(year, month - 1, day);
    const todayDate = new Date(nowInCaracas.getFullYear(), nowInCaracas.getMonth(), nowInCaracas.getDate());
    const diff = Math.floor((cutDateOnly.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  }).sort((a, b) => {
    const [yearA, monthA, dayA] = a.cutDate.split("-").map(Number);
    const [yearB, monthB, dayB] = b.cutDate.split("-").map(Number);
    return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
  });

  const overdueSubs = activeSubs.filter((sub) => {
    if (!sub.cutDate) return false;
    const nowInCaracas = getNowInCaracas();
    const [year, month, day] = sub.cutDate.split("-").map(Number);
    const cutDateOnly = new Date(year, month - 1, day);
    const todayDate = new Date(nowInCaracas.getFullYear(), nowInCaracas.getMonth(), nowInCaracas.getDate());
    const diff = Math.floor((cutDateOnly.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff < 0;
  }).sort((a, b) => {
    const [yearA, monthA, dayA] = a.cutDate.split("-").map(Number);
    const [yearB, monthB, dayB] = b.cutDate.split("-").map(Number);
    return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
  });

  if (upcomingSubs.length === 0 && overdueSubs.length === 0) return null;

  return (
    <>
      <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
        Controla los planes activos, fechas de corte y facturación mensual.
      </p>

      <div className="space-y-4">
        {upcomingSubs.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-primary dark:text-slate-200 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-primary dark:text-slate-200">Suscripciones por vencer esta semana</span>
            </div>

            <div className="flex flex-col gap-3">
              {upcomingSubs.map((sub) => {
                const client = clientsList.find((c) => c.uid === sub.clientId || c.id === sub.clientId);
                const nowInCaracas = getNowInCaracas();
                const [year, month, day] = sub.cutDate.split("-").map(Number);
                const cutDateOnly = new Date(year, month - 1, day);
                const todayDate = new Date(nowInCaracas.getFullYear(), nowInCaracas.getMonth(), nowInCaracas.getDate());
                const diff = Math.floor((cutDateOnly.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={sub.id ?? sub.clientId} className="flex items-center gap-2 md:gap-4 p-3 rounded-xl border border-secondary dark:border-secondary bg-secondary/50 shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate dark:text-primary text-sm px-2 py-1 rounded bg-secondary uppercase">{client?.name || "Cliente desconocido"}</span>
                    </div>
                    <div className="flex-1 text-center">
                      <span className="inline-block text-xs font-semibold px-2 py-1 rounded bg-secondary text-primary dark:text-primary">
                        {diff === 0 ? (
                          <span>¡Vence hoy!</span>
                        ) : (
                          <span>
                            Faltan <b className="text-primary">{diff}</b> día{diff > 1 ? "s" : ""} para vencer el <b>{formatDate(sub.cutDate)}</b>
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {overdueSubs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-red-600 dark:text-red-400">Suscripciones vencidas</span>
            </div>

            <div className="flex flex-col gap-3">
              {overdueSubs.map((sub) => {
                const client = clientsList.find((c) => c.uid === sub.clientId || c.id === sub.clientId);
                const nowInCaracas = getNowInCaracas();
                const [year, month, day] = sub.cutDate.split("-").map(Number);
                const cutDateOnly = new Date(year, month - 1, day);
                const todayDate = new Date(nowInCaracas.getFullYear(), nowInCaracas.getMonth(), nowInCaracas.getDate());
                const diff = Math.floor((todayDate.getTime() - cutDateOnly.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={sub.id ?? sub.clientId} className="flex items-center gap-2 md:gap-4 p-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate dark:text-primary text-sm px-2 py-1 rounded bg-secondary uppercase">{client?.name || "Cliente desconocido"}</span>
                    </div>
                    <div className="flex-1 text-center">
                      <span className="inline-block text-xs font-semibold px-2 py-1 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                        <span>Venció hace <b className="text-red-600 dark:text-red-400">{diff}</b> día{diff > 1 ? "s" : ""} el <b>{formatDate(sub.cutDate)}</b></span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
        <Link to="/admin/subscriptions" className="w-full">
          <Button variant="secondary" className="w-full justify-between group">
            <span>Ver Suscripciones</span>
            <svg className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Button>
        </Link>
      </div>
    </>
  );
}
