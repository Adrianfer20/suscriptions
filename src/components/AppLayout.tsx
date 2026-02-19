import React, { useState, useEffect } from "react";
import { NavLink, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../auth";
import { cn } from "../lib/cn";
import {
  MessageSquare,
  Zap,
  Users,
  LogOut,
  User,
  Settings,
  ChevronRight,
  LayoutDashboard,
  Briefcase,
  CreditCard,
  Moon,
  Sun,
  Receipt,
} from "lucide-react";
import { communicationsApi } from "../api";
import { useTheme } from "../context/ThemeContext";

const MENU_CONFIG: Record<
  string,
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
      label: "Comunicación",
      to: "/admin/communication",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      label: "Automatización",
      to: "/admin/automation",
      icon: <Zap className="w-5 h-5" />,
    },
    {
      label: "Usuarios",
      to: "/admin/users",
      icon: <Users className="w-5 h-5" />,
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

export default function AppLayout({
  children,
}: { children?: React.ReactNode }): React.ReactNode {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const role = user?.role ?? "guest";
  const menu = MENU_CONFIG[role] ?? [];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // State for desktop collapse
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isDesktop && collapsed) setCollapsed(false);
  }, [isDesktop, collapsed]);
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const prevUnreadCount = React.useRef(0);
  const isFirstLoad = React.useRef(true);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Request notification permission
  useEffect(() => {
    if (
      role === "admin" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, [role]);

  // Check unread count periodically if admin
  useEffect(() => {
    if (role !== 'admin') return;
    const checkUnread = async () => {
      try {
        const res = await communicationsApi.listConversations();
        const list: any[] = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const total = list.reduce(
          (acc: number, curr: any) => acc + (curr.unreadCount || 0),
          0
        );
        if (!isFirstLoad.current && total > prevUnreadCount.current) {
          if ('Notification' in window && Notification.permission === 'granted') {
            navigator.serviceWorker.ready
              .then(registration => {
                registration.showNotification('A|R System', {
                  body: `Tienes ${total} mensajes sin leer`,
                  icon: '/vite.svg',
                  // @ts-ignore
                  vibrate: [200, 100, 200]
                });
              })
              .catch(() => {
                new Notification('A|R System', {
                  body: `Tienes ${total} mensajes sin leer`,
                  icon: '/vite.svg'
                });
              });
          }
          try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Audio play failed', e));
          } catch (e) {
            // ignore
          }
        }
        prevUnreadCount.current = total;
        setUnreadCount(total);
        isFirstLoad.current = false;
      } catch (e) {
        // silent fail
      }
    };
    checkUnread();
    const interval = setInterval(checkUnread, 30000);
    return () => clearInterval(interval);
  }, [role]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col md:flex-row font-sans transition-colors duration-300 overflow-x-hidden">
      {/* Mobile Top Bar */}
      <header className="fixed top-0 inset-x-0 h-16 bg-primary dark:bg-slate-900/90 dark:border-b dark:border-slate-800 border-b border-gray-200 z-30 flex items-center justify-between px-4 md:hidden shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-white hover:bg-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            aria-label="Abrir menú"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <span className="font-bold text-lg text-white truncate">
            A<span className="text-secondary">|</span>R SYSTEM
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Notification Icon */}
          {role === "admin" && (
            <NavLink
              to="/admin/communication"
              className="relative p-1.5 text-white/80 hover:text-white transition-colors"
            >
              <MessageSquare size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white border border-primary">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </NavLink>
          )}

          <NavLink
            to="/admin/me"
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-full bg-white text-primary border border-gray-200 flex items-center justify-center text-xs font-bold shadow-sm">
              {(user?.displayName || user?.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
          </NavLink>
        </div>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 bg-white dark:bg-slate-950/50 border-r border-gray-200/50 dark:border-slate-800 z-50 transform transition-all duration-300 ease-in-out flex flex-col shadow-2xl md:shadow-none md:translate-x-0 md:sticky md:top-0 md:h-screen backdrop-blur-xl",
          sidebarOpen
            ? "translate-x-0 w-72"
            : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-20" : "md:w-72",
          "w-72", // Mobile width always 72
        )}
      >
        {/* Sidebar Header */}
        <div
          className={cn(
            "h-20 flex items-center border-b border-gray-100 dark:border-slate-800 shrink-0 transition-all duration-300",
            collapsed ? "justify-center px-0" : "px-6 justify-between",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              collapsed ? "justify-center" : "",
            )}
          >
            <div
              className="h-12 w-12 min-w-12 bg-primary rounded-md flex items-center justify-center text-white shadow-lg shadow-primary/25 cursor-pointer transition-transform hover:scale-105"
              onClick={() => setCollapsed(!collapsed)}
            >
              <span className="font-extrabold text-xl">
                A<span className="text-secondary">|</span>R
              </span>
            </div>
            {!collapsed && (
              <div className="flex flex-col whitespace-nowrap overflow-hidden transition-all duration-300">
                <span className="font-bold text-lg leading-tight text-slate-900 dark:text-white">
                  SYSTEM
                </span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                  Management
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="hidden md:flex p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-8 px-3 scrollbar-hide">
          {!collapsed && (
            <div className="mb-2 px-3">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                Menu Principal
              </p>
            </div>
          )}
          <nav className="space-y-2">
            {menu.map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                end={m.to === "/admin" || m.to === "/client"}
                onClick={() => setSidebarOpen(false)}
                title={collapsed ? m.label : undefined}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/25"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white",
                    collapsed ? "justify-center" : "",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "transition-colors",
                        isActive
                          ? "text-white"
                          : "text-slate-400 dark:text-slate-500 group-hover:text-primary dark:group-hover:text-white",
                      )}
                    >
                      {m.icon}
                    </span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 whitespace-nowrap overflow-hidden transition-all duration-300">
                          {m.label}
                        </span>
                        {isActive && (
                          <ChevronRight className="w-4 h-4 text-white/50" />
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Footer - Enhanced */}
        <div
          className={cn(
            "border-t border-gray-100 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-900/50 backdrop-blur-sm shrink-0 transition-all duration-300",
            collapsed ? "p-2" : "p-4",
          )}
        >
          {!collapsed && (
            <div className="mb-2 px-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Cuenta
              </span>
            </div>
          )}

          <div
            className={cn(
              "bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden",
              collapsed ? "p-1" : "p-3",
            )}
          >
            <NavLink
              to={
                role === "admin"
                  ? "/admin/me"
                  : role === "client"
                    ? "/client/profile"
                    : "/"
              }
              onClick={() => setSidebarOpen(false)}
              title={collapsed ? "Perfil" : undefined}
              className={cn(
                "flex items-center gap-3 -mx-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors cursor-pointer group",
                collapsed ? "justify-center mx-0 p-1 mb-0" : "p-2",
              )}
            >
              <div className="h-10 w-10 min-w-10 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-600 flex items-center justify-center text-sm font-bold text-primary dark:text-white shadow-sm overflow-hidden shrink-0">
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
              {!collapsed && (
                <div className="flex-1 min-w-0 transition-all duration-300">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-white/70 transition-colors">
                    {user?.displayName || "Usuario"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                    {user?.email}
                  </p>
                </div>
              )}
            </NavLink>

            {!collapsed && (
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                <button
                  onClick={logout}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 dark:text-slate-400 dark:hover:text-red-400 transition-all border border-transparent hover:border-red-100 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Salir</span>
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs font-medium text-slate-500 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary dark:text-slate-400 dark:hover:text-slate-200 transition-all border border-transparent hover:border-primary/10 cursor-pointer"
                >
                  {theme === "light" ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4" />
                  )}
                  <span>{theme === "light" ? "Oscuro" : "Claro"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1 min-w-0 w-full min-h-[calc(100vh-4rem)] md:min-h-screen pt-16 md:pt-0 bg-gray-50 dark:bg-slate-900 transition-all duration-300",
          // En pantallas medianas si el sidebar está abierto (mobile mode pero en md screens si ocurriera) o colapsado, adjustment
        )}
      >
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}
