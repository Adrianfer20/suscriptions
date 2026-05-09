import { Suspense, useState, useEffect, lazy } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Header from './layout/Header'
import Sidebar from './layout/Sidebar'
import { cn } from '../lib/cn'

const FCMInitializer = lazy(() => import('./FCMInitializer'))

export default function AppLayout({ children }: { children?: React.ReactNode }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const role = user?.role ?? 'client'

  const COLLAPSE_MIN = 768
  const EXPAND_MIN = 1024

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1024
    if (w < COLLAPSE_MIN) return true
    if (w < EXPAND_MIN) return true
    return false
  })
  const [isDesktop, setIsDesktop] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= COLLAPSE_MIN : true))

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      setIsDesktop(w >= COLLAPSE_MIN)
      if (w < COLLAPSE_MIN) {
        setSidebarOpen(false)
        setCollapsed(true)
        return
      }
      if (w < EXPAND_MIN) {
        setCollapsed(true)
        return
      }
      setCollapsed(false)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
  }, [])

  const [unreadCount, setUnreadCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row font-sans transition-colors duration-300 overflow-x-hidden">
      {role === 'admin' && (
        <Suspense>
          <FCMInitializer role={role} onUnreadChange={setUnreadCount} />
        </Suspense>
      )}

      <Header
        role={role}
        user={user}
        unreadCount={unreadCount}
        onOpenSidebar={() => setSidebarOpen(true)}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        role={role}
        user={user}
        unreadCount={unreadCount}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        logout={logout}
        theme={theme}
        toggleTheme={toggleTheme}
        isDesktop={isDesktop}
      />

      <main
        className={cn(
          'flex-1 min-w-0 w-full min-h-[calc(100vh-4rem)] md:min-h-screen pt-16 md:pt-0 bg-slate-50 dark:bg-slate-900 transition-all duration-300',
          collapsed ? 'md:pl-20' : 'md:pl-72'
        )}
      >
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  )
}
