import { useEffect, useState } from 'react'
import api from '../services/api'
import { Subscription, Client } from '../services/api'

export default function useClientDashboard(userId?: string | null) {
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [clientData, setClientData] = useState<Client | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      if (!userId) {
        if (mounted) {
          setError('No se encontró el usuario')
          setLoading(false)
        }
        return
      }

      try {
        setLoading(true)

        // 1. Obtener datos del cliente desde /auth/me (backend)
        const authRes = await api.get('/auth/me').catch(() => null)
        const authData = authRes?.data?.data || authRes?.data || null

        // 2. Obtener cliente desde /clients usando el uid
        try {
          const clientRes = await api.get(`/clients/${userId}`)
          const client = clientRes.data?.data || clientRes.data
          if (mounted) setClientData(client)
        } catch (e) {
          // ignore if not found
        }

        if (!mounted) return

        // 3. Obtener suscripciones y filtrar por clientId (uid)
        const subsRes = await api.get('/subscriptions')
        const subscriptions = subsRes.data?.data || subsRes.data || []

        const userSubscriptions = (subscriptions as Subscription[]).filter(
          (sub: Subscription) => sub.clientId === userId,
        )

        const active = userSubscriptions.find((sub: Subscription) => sub.status === 'active')

        if (active) {
          if (mounted) setSubscription({ ...active, clientName: authData?.displayName || '', clientEmail: authData?.email || '' } as any)
        } else {
          if (mounted) setSubscription(null)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        if (mounted) setError('No se pudieron cargar los datos')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [userId])

  const clearError = () => setError(null)

  return { loading, subscription, clientData, error, clearError }
}
