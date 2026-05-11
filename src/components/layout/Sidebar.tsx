import React from "react";
import { NavLink } from "react-router-dom";
import {
  MessageSquare,
  Zap,
  LogOut,
  User,
  LayoutDashboard,
  Briefcase,
  CreditCard,
  Moon,
  Sun,
  Receipt,
  DollarSign,
  LucidePanelRightOpen,
} from "lucide-react";

import { cn } from "../../lib/cn";
import { Button } from "../ui/Button";

type Role = "admin" | "client";

interface UserData {
  displayName?: string;
  email?: string;
  photoURL?: string;
}

interface SidebarProps {
  role: Role;
  user: UserData;
  unreadCount: number;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  logout: () => void;
  theme: string;
  toggleTheme: () => void;
  isDesktop: boolean;
}

const MENU_CONFIG: Record<
  Role,
  { label: string; to: string; icon: React.ReactNode }[]
> = {
  admin: [
    {
      label: "Dashboard",
      to: "/admin",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Clientes",
      to: "/admin/clients",
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      label: "Suscripciones",
      to: "/admin/subscriptions",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      label: "Pagos",
      to: "/admin/payments",
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      label: "Comunicación",
      to: "/admin/communication",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      label: "Automatización",
      to: "/admin/automation",
      icon: <Zap className="w-5 h-5" />,
    },
  ],

  client: [
    {
      label: "Dashboard",
      to: "/client",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Mi suscripción",
      to: "/client/subscription",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      label: "Historial de pagos",
      to: "/client/payments",
      icon: <Receipt className="w-5 h-5" />,
    },
    {
      label: "Mi perfil",
      to: "/client/profile",
      icon: <User className="w-5 h-5" />,
    },
  ],
};

export default function Sidebar({
  role,
  user,
  collapsed,
  setCollapsed,
  sidebarOpen,
  setSidebarOpen,
  logout,
  theme,
  toggleTheme,
  isDesktop,
}: SidebarProps) {
  const menu = MENU_CONFIG[role] ?? [];

  const effectiveCollapsed = collapsed && isDesktop;

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col",
          "bg-white dark:bg-slate-950",
          "border-r border-slate-200 dark:border-slate-800",
          "transition-all duration-300 ease-out",
          "md:translate-x-0",
          sidebarOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full md:translate-x-0",
          effectiveCollapsed ? "md:w-18" : "md:w-64",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "h-16 shrink-0 border-b  bg-primary  border-slate-200 dark:border-slate-800",
            "flex items-center justify-center",
            effectiveCollapsed ? "justify-center px-2" : "px-4",
          )}
        >
          <div
            className={cn(
              "flex items-center min-w-0",
              effectiveCollapsed ? "justify-center" : "gap-3",
            )}
          >
            {
              effectiveCollapsed ? (
                <div className="h-9 w-9 rounded-md flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">
                    A
                    <span className="text-secondary">|</span>
                    R
                  </span>
                </div>
              ) : (
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="font-semibold uppercase text-white dark:text-white truncate">
                    A<span className="text-secondary">|</span>R  System
                  </span>
                </div>
              )
            }


          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-5 px-2">
          {!effectiveCollapsed && (
            <div className="px-3 mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Menu
              </p>
            </div>
          )}



          <nav className="space-y-1">
            {/* Collapse Toggle */}
            {isDesktop && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className={cn(
                  "group flex items-center w-full h-11 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
                  "text-slate-600 dark:text-slate-400",
                  "hover:bg-slate-100 dark:hover:bg-slate-800/60",
                  "hover:text-slate-900 dark:hover:text-white",
                  effectiveCollapsed
                    ? "justify-center px-0 mb-2"
                    : "px-3 gap-3 mb-3",
                )}
              >
                <span className="shrink-0 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                  <LucidePanelRightOpen
                    className={cn(
                      "w-5 h-5 transition-transform duration-300",
                      effectiveCollapsed && "rotate-180",
                    )}
                  />
                </span>

                {!effectiveCollapsed && (
                  <span className="truncate">
                    Ocultar Menu
                  </span>
                )}
              </button>
            )}
            {menu.map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                end={m.to === "/admin" || m.to === "/client"}
                title={effectiveCollapsed ? m.label : undefined}
                onClick={() => {
                  if (!isDesktop) {
                    setSidebarOpen(false);
                  }
                }}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center gap-3",
                    "h-11 rounded-xl text-sm font-medium",
                    "transition-all duration-200",
                    isActive
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-secondary"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white",
                    effectiveCollapsed
                      ? "justify-center px-0"
                      : "px-3",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary dark:bg-secondary" />
                    )}

                    {/* Icon */}
                    <span
                      className={cn(
                        "shrink-0 transition-colors",
                        isActive
                          ? "text-primary dark:text-secondary"
                          : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200",
                      )}
                    >
                      {m.icon}
                    </span>

                    {/* Label */}
                    {!effectiveCollapsed && (
                      <span className="flex-1 truncate">
                        {m.label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-3">
          <div
            className={cn(
              "flex items-center",
              effectiveCollapsed
                ? "flex-col gap-3"
                : "justify-between gap-3",
            )}
          >
            {/* User */}
            <NavLink
              to={
                role === "admin"
                  ? "/admin/me"
                  : "/client/profile"
              }
              onClick={() => {
                if (!isDesktop) {
                  setSidebarOpen(false);
                }
              }}
              className={cn(
                "flex items-center transition-all duration-200",
                effectiveCollapsed
                  ? "justify-center"
                  : "flex-1 gap-3 min-w-0",
              )}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-linear-to-br from-primary to-primary/80 flex items-center justify-center text-white text-sm font-semibold">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (user?.displayName || user?.email || "?")
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>

                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950" />
              </div>

              {!effectiveCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {user?.displayName || "Usuario"}
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>
              )}
            </NavLink>

            {/* Actions */}
            <div
              className={cn(
                "flex items-center",
                effectiveCollapsed
                  ? "flex-col gap-2"
                  : "gap-1",
              )}
            >
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="icon"
                className="text-slate-500 hover:text-amber-500"
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </Button>

              <Button
                onClick={logout}
                variant="ghost"
                size="icon"
                className="text-slate-500 hover:text-red-500"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
