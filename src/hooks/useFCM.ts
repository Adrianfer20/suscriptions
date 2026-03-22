import { useEffect, useState, useCallback } from 'react'
import { getToken, onMessage, Messaging } from 'firebase/messaging'
import { initMessaging, getMessagingInstance } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

export interface FCMMessage {
  notification?: {
    title?: string
    body?: string
  }
  data?: Record<string, string>
  from?: string
  messageId?: string
}

export interface UseFCMReturn {
  fcmToken: string | null
  isSupported: boolean
  permissionStatus: NotificationPermission | null
  isLoading: boolean
  error: string | null
  requestPermission: () => Promise<string | null>
  lastMessage: FCMMessage | null
}

export function useFCM(): UseFCMReturn {
  const { user } = useAuth()
  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastMessage, setLastMessage] = useState<FCMMessage | null>(null)

  // Verificar soporte al inicio
  useEffect(() => {
    const checkSupport = async () => {
      try {
        const { isSupported } = await import('firebase/messaging')
        const supported = await isSupported()
        setIsSupported(supported)
        
        if ('Notification' in window) {
          setPermissionStatus(Notification.permission)
        }
      } catch (e) {
        setIsSupported(false)
        console.error('Firebase Messaging no disponible:', e)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkSupport()
  }, [])

  // Escuchar mensajes cuando la app está en foreground
  useEffect(() => {
    if (!isSupported) return

    let messaging: Messaging | null = null

    const setupMessaging = async () => {
      try {
        messaging = await initMessaging()
        if (!messaging) return

        // Escuchar mensajes en foreground
        const unsubscribe = onMessage(messaging, (payload) => {
          console.log('[useFCM] Mensaje recibido en foreground:', payload)
          setLastMessage(payload as FCMMessage)
          
          // Mostrar toast notification
          if (payload.notification) {
            toast.success(payload.notification.body || 'Nuevo mensaje', {
              id: payload.messageId,
              duration: 5000
            })
          }
        })

        return () => {
          unsubscribe()
        }
      } catch (e) {
        console.error('[useFCM] Error configurando onMessage:', e)
      }
    }

    const cleanup = setupMessaging()
    return () => {
      cleanup?.then(unsubscribe => unsubscribe?.())
    }
  }, [isSupported])

  // Registrar token FCM en el backend
  const registerTokenOnBackend = useCallback(async (token: string) => {
    if (!user?.id) {
      console.log('[useFCM] No hay usuario logueado, no se registra token')
      return
    }

    try {
      await api.post('/notifications/token', {
        token,
        clientId: user.id,
        deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
      })
      console.log('[useFCM] Token FCM registrado en el backend')
    } catch (e) {
      console.error('[useFCM] Error registrando token en backend:', e)
    }
  }, [user])

  // Solicitar permiso y obtener token
  const requestPermission = useCallback(async (): Promise<string | null> => {
    if (!isSupported) {
      setError('Firebase Messaging no es soportado en este navegador')
      return null
    }

    try {
      // Verificar permiso de notificaciones del navegador
      let permission: NotificationPermission = 'default'
      if ('Notification' in window) {
        permission = await Notification.requestPermission()
        setPermissionStatus(permission)
        
        if (permission !== 'granted') {
          setError('Permiso de notificaciones denegado')
          return null
        }
      }

      // Inicializar messaging
      const messaging = await initMessaging()
      if (!messaging) {
        setError('No se pudo inicializar Firebase Messaging')
        return null
      }

      // Obtener token FCM
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      })
      
      setFcmToken(token)
      setError(null)
      
      console.log('[useFCM] Token FCM obtenido:', token.substring(0, 20) + '...')
      
      // Registrar token en el backend
      await registerTokenOnBackend(token)
      
      return token
    } catch (e: any) {
      console.error('[useFCM] Error obteniendo token:', e)
      
      if (e.code === 'messaging/permission-blocked') {
        setError('Las notificaciones están bloqueadas. Por favor habilítalas en configuración.')
      } else if (e.code === 'messaging/failed-service-worker-registration') {
        setError('Error registrando el service worker. Recarga la página.')
      } else if (e.code === 'messaging/vapid-key-required') {
        setError('Falta la clave VAPID. Configura VITE_FIREBASE_VAPID_KEY.')
      } else {
        setError(e.message || 'Error al obtener token de notificaciones')
      }
      
      return null
    }
  }, [isSupported, registerTokenOnBackend])

  return {
    fcmToken,
    isSupported,
    permissionStatus,
    isLoading,
    error,
    requestPermission,
    lastMessage
  }
}
