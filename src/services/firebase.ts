import { initializeApp, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getMessaging, isSupported } from 'firebase/messaging'

let app: ReturnType<typeof initializeApp> | null = null
let authInstance: ReturnType<typeof getAuth> | null = null
let messagingInstance: ReturnType<typeof getMessaging> | null = null

export function initFirebase() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
  if (!apiKey) return
  const config = {
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  }
  try {
    app = initializeApp(config)
    authInstance = getAuth(app)
  } catch (e) {
    // already initialized or missing config
    try {
      authInstance = getAuth()
    } catch (err) {
      // ignore
    }
  }
}

export function getAuthInstance() {
  try {
    if (authInstance) return authInstance
    return getAuth()
  } catch (e) {
    return null
  }
}

// Inicializar Messaging (solo si está soportado y configurado)
export async function initMessaging(): Promise<ReturnType<typeof getMessaging> | null> {
  if (messagingInstance) return messagingInstance
  
  try {
    const supported = await isSupported()
    if (!supported) {
      console.warn('Firebase Messaging no es soportado en este navegador')
      return null
    }
    
    const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
    if (!messagingSenderId) {
      console.warn('VITE_FIREBASE_MESSAGING_SENDER_ID no está configurado')
      return null
    }
    
    messagingInstance = getMessaging(app || getApp())
    return messagingInstance
  } catch (e) {
    console.error('Error inicializando Firebase Messaging:', e)
    return null
  }
}

export function getMessagingInstance() {
  return messagingInstance
}
