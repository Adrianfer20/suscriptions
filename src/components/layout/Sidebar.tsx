import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  MessageSquare,
  Zap,
  Users,
  LogOut,
  User,
  ChevronRight,
  LayoutDashboard,
  Briefcase,
  CreditCard,
  Moon,
  Sun,
  Receipt,
  DollarSign,
} from 'lucide-react'
import { cn } from '../../lib/cn'

const MENU_CONFIG: Record<string, { label: string; to: string; icon: React.ReactNode }[]> = {
  admin: [
    { label: 'Dashboard', to: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Clientes', to: '/admin/clients', icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Suscripciones', to: '/admin/subscriptions', icon: <CreditCard className="w-5 h-5" /> },
    { label: 'Pagos', to: '/admin/payments', icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Comunicación', to: '/admin/communication', icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Automatización', to: '/admin/automation', icon: <Zap className="w-5 h-5" /> },
    { label: 'Usuarios', to: '/admin/users', icon: <Users className="w-5 h-5" /> },
  ],
  client: [
    { label: 'Dashboard', to: '/client', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Mi suscripción', to: '/client/subscription', icon: <CreditCard className="w-5 h-5" /> },
    { label: 'Historial de pagos', to: '/client/payments', icon: <Receipt className="w-5 h-5" /> },
    { label: 'Mi perfil', to: '/client/profile', icon: <User className="w-5 h-5" /> },
  ],
}

export default function Sidebar({
  role,
  user,
  unreadCount,
  collapsed,
  setCollapsed,
  sidebarOpen,
  setSidebarOpen,
  logout,
  theme,
  toggleTheme,
  isDesktop,
}: {
  role: string
  user: any
  unreadCount: number
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  logout: () => void
  theme: string
  toggleTheme: () => void
  isDesktop: boolean
}) {
  const menu = MENU_CONFIG[role] ?? []
  const effectiveCollapsed = collapsed && isDesktop

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 bg-white dark:bg-slate-950/50 border-r border-gray-200/50 dark:border-slate-800 z-50 transform transition-all duration-300 ease-in-out flex flex-col shadow-2xl md:shadow-none md:translate-x-0 md:fixed md:top-0 md:left-0 md:h-screen backdrop-blur-xl',
        sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0',
        effectiveCollapsed ? 'md:w-20' : 'md:w-72',
        'w-72',
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'h-20 flex items-center border-b border-gray-100 dark:border-slate-800 shrink-0 transition-all duration-300',
          collapsed ? 'justify-center px-0' : 'px-6 justify-between'
        )}
      >
        <div className={cn('flex items-center gap-3', collapsed ? 'justify-center' : '')}>
          <div
            className="h-12 w-12 min-w-12 bg-primary rounded-md flex items-center justify-center text-white shadow-lg shadow-primary/25 cursor-pointer transition-transform hover:scale-105"
            onClick={() => setCollapsed(!collapsed)}
          >
            <span className="font-extrabold text-xl">A<span className="text-secondary">|</span>R</span>
          </div>

          {!effectiveCollapsed && (
            <div className="flex flex-col whitespace-nowrap overflow-hidden transition-all duration-300">
              <span className="font-bold text-lg leading-tight text-slate-900 dark:text-white">SYSTEM</span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Management</span>
            </div>
          )}
        </div>

        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="hidden md:flex p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-8 px-3 scrollbar-hide">
        {!effectiveCollapsed && (
          <div className="mb-2 px-3">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Menu Principal</p>
          </div>
        )}

        <nav className="space-y-2">
          {menu.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.to === '/admin' || m.to === '/client'}
              onClick={() => setSidebarOpen(false)}
              title={effectiveCollapsed ? m.label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white',
                  collapsed ? 'justify-center' : ''
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className={cn('transition-colors', isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary dark:group-hover:text-white')}>
                    {m.icon}
                  </span>
                  {!effectiveCollapsed && (
                    <>
                      <span className="flex-1 whitespace-nowrap overflow-hidden transition-all duration-300">{m.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
                    </>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Account / Footer */}
      <div className={cn('border-t border-gray-100 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-900/50 backdrop-blur-sm shrink-0 transition-all duration-300', collapsed ? 'p-2' : 'p-4')}>
        {!effectiveCollapsed && (
          <div className="mb-2 px-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cuenta</span>
          </div>
        )}

        <div className={cn('bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden', collapsed ? 'p-1' : 'p-3')}>
          <div className={cn('bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 overflow-hidden', effectiveCollapsed ? 'p-1' : 'p-3')}>
            <NavLink
              to={role === 'admin' ? '/admin/me' : role === 'client' ? '/client/profile' : '/'}
              onClick={() => setSidebarOpen(false)}
              title={collapsed ? 'Perfil' : undefined}
              className={cn('flex items-center gap-3 -mx-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors cursor-pointer group', collapsed ? 'justify-center mx-0 p-1 mb-0' : 'p-2')}
            >
              <div className="h-10 w-10 min-w-10 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-600 flex items-center justify-center text-sm font-bold text-primary dark:text-white shadow-sm overflow-hidden shrink-0">
                {user?.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : (user?.displayName || user?.email || '?').charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 transition-all duration-300">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-white/70 transition-colors">{user?.displayName || 'Usuario'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">{user?.email}</p>
                </div>
              )}
            </NavLink>

            {!effectiveCollapsed && (
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                <button onClick={logout} className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 dark:text-slate-400 dark:hover:text-red-400 transition-all border border-transparent hover:border-red-100 cursor-pointer">
                  <LogOut className="w-4 h-4" />
                  <span>Salir</span>
                </button>
                <button onClick={toggleTheme} className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs font-medium text-slate-500 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary dark:text-slate-400 dark:hover:text-slate-200 transition-all border border-transparent hover:border-primary/10 cursor-pointer">
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  <span>{theme === 'light' ? 'Oscuro' : 'Claro'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
