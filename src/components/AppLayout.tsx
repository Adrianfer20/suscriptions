import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { communicationsApi } from '../services/api'
import { useTheme } from '../context/ThemeContext'
import { useFCM } from '../hooks/useFCM'
import Header from './layout/Header'
import Sidebar from './layout/Sidebar'
import { cn } from '../lib/cn'

export default function AppLayout({ children }: { children?: React.ReactNode }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const role = user?.role ?? 'guest'

  const COLLAPSE_MIN = 768
  const EXPAND_MIN = 1024

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1024
    if (w < COLLAPSE_MIN) return true // mobile default (hidden)
    if (w < EXPAND_MIN) return true // medium: icons only
    return false // large: expanded
  })
  const [isDesktop, setIsDesktop] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= COLLAPSE_MIN : true))

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      setIsDesktop(w >= COLLAPSE_MIN)

      // mobile: close overlay sidebar
      if (w < COLLAPSE_MIN) {
        setSidebarOpen(false)
        setCollapsed(true)
        return
      }

      // medium: icons only
      if (w < EXPAND_MIN) {
        setCollapsed(true)
        return
      }

      // large: expanded
      setCollapsed(false)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [unreadCount, setUnreadCount] = useState(0)
  const prevUnreadCount = React.useRef(0)
  const isFirstLoad = React.useRef(true)

  useEffect(() => {
    setSidebarOpen(false)
  }, [])

  // Firebase Cloud Messaging
  const { requestPermission: requestFCMPermission, isSupported: fcmSupported, error: fcmError } = useFCM()

  // Solicitar permiso de notificaciones (FCM + navegador)
  useEffect(() => {
    if (role === 'admin' && fcmSupported) {
      // Intentar obtener permiso de notificaciones del navegador
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
      // También intentar obtener token FCM
      requestFCMPermission().then(token => {
        if (token) {
          console.log('[AppLayout] FCM Token obtenido, listo para recibir notificaciones push')
          // Aquí podrías enviar el token al backend para guardarlo
          // api.post('/notifications/token', { token })
        }
      }).catch(err => {
        console.warn('[AppLayout] Error con FCM:', err)
      })
    }
  }, [role, fcmSupported, requestFCMPermission])

  // Polling para verificar mensajes sin leer (como backup de FCM)
  useEffect(() => {
    if (role !== 'admin') return
    const checkUnread = async () => {
      try {
        const res = await communicationsApi.listConversations()
        const list: any[] = Array.isArray(res.data) ? res.data : (res.data?.data || [])
        const total = list.reduce((acc: number, curr: any) => acc + (curr.unreadCount || 0), 0)
        if (!isFirstLoad.current && total > prevUnreadCount.current) {
          // FCM maneja las notificaciones push, pero reproducimos sonido como backup
          try {
            const audio = new Audio('/suscriptions/notification.mp3')
            audio.play().catch(() => {})
          } catch (e) {
            // ignore
          }
        }
        prevUnreadCount.current = total
        setUnreadCount(total)
        isFirstLoad.current = false
      } catch (e) {
        // silent
      }
    }
    checkUnread()
    const interval = setInterval(checkUnread, 30000)
    return () => clearInterval(interval)
  }, [role])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row font-sans transition-colors duration-300 overflow-x-hidden">
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
