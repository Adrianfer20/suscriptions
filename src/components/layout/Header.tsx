import React from 'react'
import { NavLink } from 'react-router-dom'
import { MessageSquare, ChevronRight } from 'lucide-react'
import { Button } from '../ui/Button'

export default function Header({
  role,
  user,
  unreadCount,
  onOpenSidebar,
  collapsed,
  setCollapsed,
}: {
  role: string
  user: any
  unreadCount: number
  onOpenSidebar: () => void
  collapsed: boolean
  setCollapsed: (v: boolean) => void
}) {
  return (
    <header className="fixed top-0 inset-x-0 h-16 bg-primary dark:bg-slate-900/90 dark:border-b dark:border-slate-800 border-b border-gray-200 z-30 flex items-center justify-between px-4 md:hidden shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Button
          onClick={onOpenSidebar}
          className="p-2 -ml-2"
          aria-label="Abrir menú"
          variant="ghost"
          size="icon"
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
        </Button>
        <span className="font-bold text-lg text-white truncate">
          A<span className="text-secondary">|</span>R SYSTEM
        </span>
      </div>

      <div className="flex items-center gap-3">
        {role === 'admin' && (
          <NavLink
            to="/admin/communication"
            className="relative p-1.5 text-white/80 hover:text-white transition-colors"
          >
            <MessageSquare size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white border border-primary">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        )}

        <NavLink
          to={role === 'admin' ? '/admin/me' : role === 'client' ? '/client/profile' : '/'}
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="h-8 w-8 rounded-full bg-white text-primary border border-gray-200 flex items-center justify-center text-xs font-bold shadow-sm">
            {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
        </NavLink>
        {/* Collapse toggle for desktop */}
        <Button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:inline-flex ml-3 items-center justify-center p-2"
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          variant="ghost"
          size="icon"
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : 'rotate-0'}`} />
        </Button>
      </div>
    </header>
  )
}
