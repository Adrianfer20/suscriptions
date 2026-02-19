import React, { useEffect, useState } from 'react'
import { healthApi } from '../api' // Use new healthApi
import { Card } from '../components/ui/Card'

export default function Home() {
  const [status, setStatus] = useState<any>(null)
  const [items, setItems] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    healthApi.check()
      .then((res) => {
        if (mounted) setStatus(res.data)
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])


  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Bienvenido</h1>
        <p className="text-gray-500 mt-2 text-lg">Plataforma de gestión de servicios Starlink.</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 px-1">Novedades</h2>
        {loading ? (
             <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
                ))}
             </div>
        ) : items.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((it, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                    <p className="text-gray-600">{it}</p>
                </Card>
            ))}
            </div>
        ) : (
            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No hay novedades recientes.
            </div>
        )}
      </div>
    </div>
  )
}

