import { useEffect, useRef, useState } from 'react'
import { useFCM } from '../hooks/useFCM'
import { communicationsApi } from '../services/api'

export default function FCMInitializer({ role, onUnreadChange }: { role: string; onUnreadChange: (count: number) => void }) {
  const { requestPermission, isSupported } = useFCM()
  const prevUnreadCount = useRef(0)
  const isFirstLoad = useRef(true)

  useEffect(() => {
    if (role === 'admin' && isSupported) {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
      requestPermission().then(token => {
        if (token) console.log('[FCM] Token obtenido')
      }).catch(err => {
        console.warn('[FCM] Error:', err)
      })
    }
  }, [role, isSupported, requestPermission])

  useEffect(() => {
    if (role !== 'admin') return
    const checkUnread = async () => {
      try {
        const res = await communicationsApi.listConversations()
        const list: any[] = Array.isArray(res.data) ? res.data : (res.data?.data || [])
        const total = list.reduce((acc: number, curr: any) => acc + (curr.unreadCount || 0), 0)
        if (!isFirstLoad.current && total > prevUnreadCount.current) {
          try {
            const audio = new Audio('/suscriptions/notification.mp3')
            audio.play().catch(() => {})
          } catch {
            // ignore
          }
        }
        prevUnreadCount.current = total
        isFirstLoad.current = false
        onUnreadChange(total)
      } catch {
        // silent
      }
    }
    checkUnread()
    const interval = setInterval(checkUnread, 30000)
    return () => clearInterval(interval)
  }, [role, onUnreadChange])

  return null
}
