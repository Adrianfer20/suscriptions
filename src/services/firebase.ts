import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

let app: ReturnType<typeof initializeApp> | null = null
let authInstance: ReturnType<typeof getAuth> | null = null

export function initFirebase() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
  if (!apiKey) return
  const config = {
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
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
