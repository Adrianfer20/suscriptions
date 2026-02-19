import axios, { AxiosResponse } from 'axios'
import { getAuthInstance } from './firebase'

// En desarrollo prioriza localhost:3000, en producción usa la variable de entorno
const baseURL = import.meta.env.VITE_API_BASE

export const api = axios.create({ baseURL })

// Attach idToken from Firebase Auth to each request (if user signed in)
api.interceptors.request.use(async (config) => {
  try {
    const auth = getAuthInstance() as any
    const user = auth?.currentUser
    if (user) {
      const idToken = await user.getIdToken()
      config.headers['Authorization'] = `Bearer ${idToken}`
    }
  } catch (e) {
    // ignore token attach errors
  }
  return config
})

// --- Interfaces ---

export interface ApiResponse<T = any> {
  ok: boolean
  message?: string
  data?: T
  errors?: any[]
}

export interface User {
  uid: string
  email: string
  displayName?: string
  role?: 'admin' | 'staff' | 'client'
  disabled?: boolean
}

export interface Client {
  id?: string // Firestore usually returns id
  uid?: string
  name: string
  email?: string
  phone: string
  address?: string
}

export interface Subscription {
  id?: string
  clientId: string
  startDate: string // YYYY-MM-DD
  cutDate: string // YYYY-MM-DD
  plan: string
  amount: string
  passwordSub?: string
  status?: 'active' | 'inactive' | 'past_due' | 'cancelled'
}

export interface FirestoreTimestamp {
  _seconds: number
  _nanoseconds: number
}

export interface CommunicationMessage {
  id?: string
  body: string
  from?: string
  to?: string
  direction?: 'inbound' | 'outbound'
  template?: string
  status?: string
  twilioSid?: string
  timestamp?: string | FirestoreTimestamp
  createdAt?: string | FirestoreTimestamp
}

export interface Conversation {
  id: string // Phone number
  phone: string
  lastMessageAt?: string | FirestoreTimestamp
  lastMessageBody?: string
  lastMessageDir?: 'inbound' | 'outbound'
  unreadCount?: number
  prospect?: boolean
  name?: string | null
  clientId?: string | null
  // Deprecated fields, keeping for safety if backend sends them
  uid?: string
  address?: string
  updatedAt?: string | FirestoreTimestamp
  createdAt?: string | FirestoreTimestamp
}

// --- API Service Functions ---

// 1. Auth
export const authApi = {
  create: async (data: { email: string; password: string; role: 'admin' | 'staff' | 'client'; displayName?: string }) => {
    return api.post<ApiResponse<{ uid: string; role: string }>>('/auth/create', data)
  },
  me: async () => {
    return api.get<ApiResponse<User>>('/auth/me')
  },
  getUser: async (uid: string) => {
    return api.get<ApiResponse<User>>(`/auth/user/${uid}`)
  },
  listUsers: async (params?: { limit?: number; pageToken?: string }) => {
    return api.get<ApiResponse<{ users: User[]; pageToken?: string }>>('/auth/users', { params })
  },
  updateUser: async (uid: string, data: { email?: string; password?: string; displayName?: string; role?: string; disabled?: boolean }) => {
    return api.patch<ApiResponse<User>>(`/auth/user/${uid}`, data)
  },
  deleteUser: async (uid: string) => {
    return api.delete<ApiResponse<any>>(`/auth/user/${uid}`)
  }
}

// 2. Clients
export const clientsApi = {
  create: async (data: Client) => {
    return api.post<ApiResponse<Client>>('/clients', data)
  },
  list: async (params?: { limit?: number; startAfter?: string }) => {
    return api.get<ApiResponse<Client[]>>('/clients', { params })
  },
  get: async (id: string) => {
    return api.get<ApiResponse<Client>>(`/clients/${id}`)
  },
  delete: async (id: string) => {
    return api.delete<ApiResponse<any>>(`/clients/${id}`)
  },
  update: async (id: string, data: Partial<Client>) => {
    return api.patch<ApiResponse<Client>>(`/clients/${id}`, data)
  }
}

// 3. Subscriptions
export const subscriptionsApi = {
  create: async (data: Subscription) => {
    return api.post<ApiResponse<Subscription>>('/subscriptions', data)
  },
  list: async (params?: { limit?: number; startAfter?: string }) => {
    return api.get<ApiResponse<Subscription[]>>('/subscriptions', { params })
  },
  get: async (id: string) => {
    return api.get<ApiResponse<Subscription>>(`/subscriptions/${id}`)
  },
  renew: async (id: string) => {
    return api.post<ApiResponse<Subscription>>(`/subscriptions/${id}/renew`)
  },
  delete: async (id: string) => {
    return api.delete<ApiResponse<any>>(`/subscriptions/${id}`)
  },
  update: async (id: string, data: Partial<Subscription>) => {
    return api.patch<ApiResponse<Subscription>>(`/subscriptions/${id}`, data)
  }
}

// 4. Communications
export const communicationsApi = {
  sendTemplate: async (data: { clientId: string; template: string }) => {
    return api.post<ApiResponse<any>>('/communications/send-template', data)
  },
  send: async (data: { clientId: string; body: string }) => {
    return api.post<ApiResponse<any>>('/communications/send', data)
  },
  listConversations: async () => {
    return api.get<ApiResponse<Conversation[]>>('/communications/conversations')
  },
  getMessages: async (clientId: string, params?: { limit?: number; startAfter?: string; orderBy?: string; sort?: string }) => {
    return api.get<ApiResponse<CommunicationMessage[]>>(`/communications/messages/${encodeURIComponent(clientId)}`, { params })
  },
  getUnreadCount: async () => {
    return api.get<ApiResponse<{ count: number }>>('/communications/unread-count')
  },
  markAsRead: async (clientId: string) => {
    return api.post<ApiResponse<any>>(`/communications/conversations/${encodeURIComponent(clientId)}/read`)
  },
  // webhook is usually external, not called by frontend
}

// 5. Automation
export const automationApi = {
  runDaily: async (params?: { dryRun?: boolean }, body?: { reason?: string }) => {
    return api.post<ApiResponse<any>>('/automation/run-daily', body, { params })
  },
  updateConfig: async (data: { enabled?: boolean; cronExpression?: string; timeZone?: string }) => {
    return api.put<ApiResponse<any>>('/automation/config', data)
  },
  getConfig: async () => {
    return api.get<ApiResponse<{ enabled: boolean; cronExpression: string; timeZone: string; nextRun?: string }>>('/automation/config')
  },
  deleteConfig: async () => {
    return api.delete<ApiResponse<any>>('/automation/config')
  }
}



// 6. Health
export const healthApi = {
  check: async () => {
    return api.get<{ status: string; firebaseClient: string; firebaseAdmin: string; twilio: string }>('/')
  }
}

export default api

