import React, { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { automationApi } from '../../api'
import { 
  Zap, 
  Clock, 
  CalendarClock, 
  BellRing, 
  AlertTriangle, 
  CheckCircle, 
  XOctagon, 
  Play, 
  Save, 
  RotateCcw,
  Activity,
  Radio,
  RefreshCw
} from 'lucide-react'

const formatCronToTime = (cron: string) => {
  try {
    const parts = cron.trim().split(' ')
    if (parts.length < 2) return cron
    
    const min = parseInt(parts[0])
    const hour = parseInt(parts[1])
    
    if (isNaN(min) || isNaN(hour)) return cron
    
    // Simple 12-hour format
    const period = hour >= 12 ? 'PM' : 'AM'
    const h = hour % 12 || 12
    const m = min.toString().padStart(2, '0')
    return `${h}:${m} ${period}`
  } catch (e) {
    return cron
  }
}

export default function AdminAutomation() {
  const [active, setActive] = useState(false)
  const [frequency, setFrequency] = useState('0 9 * * *') // Cron expression default
  const [loadingConfig, setLoadingConfig] = useState(false)
  
  // New state for manual execution
  const [dryRun, setDryRun] = useState(true)
  const [running, setRunning] = useState(false)
  const [logs, setLogs] = useState<string>('')

  React.useEffect(() => {
    const fetchConfig = async () => {
      setLoadingConfig(true)
      try {
        const res = await automationApi.getConfig()
        const data = res.data?.data || res.data
        if (data) {
          // @ts-ignore
          setActive(!!data.enabled)
          // @ts-ignore
          setFrequency(data.cronExpression || '0 9 * * *')
        }
      } catch (e) {
        console.error('Error loading config', e)
      } finally {
        setLoadingConfig(false)
      }
    }
    fetchConfig()
  }, [])

  const handleToggleActive = async () => {
    const newState = !active
    try {
      await automationApi.updateConfig({ 
        enabled: newState
      })
      setActive(newState)
      alert(newState ? 'Automatización activada' : 'Automatización desactivada')
    } catch (e: any) {
      console.error(e)
      alert(e.message || 'Error updating config')
    }
  }

  const handleSaveCron = async () => {
    try {
      if (!active) {
         // If inactive, we can still update the schedule without enabling it
         if (!confirm('La automatización está actualmente desactivada. Se actualizará la hora programada pero seguirá inactiva. ¿Continuar?')) return
      }
      
      // Send partial update with new schedule
      await automationApi.updateConfig({ 
        cronExpression: frequency,
        timeZone: 'America/Caracas',
        // Optional: we could include enabled: active explicitely, 
        // but backend should preserve it if omitted.
        // Let's include it to be explicit as per user example "Opción 2"
        enabled: active 
      })
      alert('Configuración guardada exitosamente')
    } catch (e: any) {
      console.error(e)
      alert(e.message || 'Error saving cron')
    }
        // ...existing code...
  }

  const handleResetConfig = async () => {
    if (!confirm('¿Estás seguro? Esto eliminará la configuración personalizada y restablecerá los valores predeterminados (Activo, 9:00 AM).')) return
    try {
      await automationApi.deleteConfig()
      alert('Configuración restablecida. Se recargarán los valores por defecto.')
      // Reload defaults
      setFrequency('0 9 * * *')
      setActive(true)
    } catch (e: any) {
      alert(e.message || 'Error reseting config')
    }
  }

  const handleRunDaily = async () => {
    if (!dryRun) {
      if (!confirm('ATENCIÓN: Estás a punto de ejecutar el proceso REAL. Se enviarán notificaciones a los clientes por WhatsApp/Correo. ¿Estás seguro?')) {
        return
      }
    }
    setRunning(true)
    setLogs('Ejecutando proceso...')
    try {
      const res = await automationApi.runDaily({ dryRun }, { reason: 'manual-check' })
      setLogs(JSON.stringify(res.data, null, 2))
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message
      setLogs(`Error: ${msg}`)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-6 gap-4">
        <div>
           <div className="flex items-center gap-2">
             <Zap className="w-5 h-5 text-yellow-500" />
             <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Automatización</h2>
           </div>
           <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
             Zona Horaria: <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-1 py-0.5 rounded ml-1">America/Caracas</span>
           </p>
           <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
             Frecuencian Actual: <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-1 py-0.5 rounded ml-1">({formatCronToTime(frequency)})</span>
             
           </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
           {loadingConfig && <span className="text-sm text-slate-500 dark:text-slate-400 text-center">Cargando...</span>}
           <Button 
            onClick={handleToggleActive} 
            variant={active ? 'destructive' : 'primary'}
            disabled={loadingConfig}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 ${active ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border-red-200 dark:border-red-800' : ''}`}
          >
            {active ? <><XOctagon size={18} /> Desactivar Tarea</> : <><CheckCircle size={18} /> Activar Tarea ({formatCronToTime(frequency)})</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Programación de Facturas">
          <div className="flex items-center gap-2 mb-4 text-slate-500 dark:text-slate-400">
             <CalendarClock size={16} />
             <p className="text-sm">Configura cuándo se envían las facturas automáticas.</p>
          </div>
          
          <div className="space-y-4">
             <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input 
                      label="Frecuencia" 
                      value={frequency} 
                      onChange={(e) => setFrequency(e.target.value)} 
                      helpText="min hora dia mes *"
                      className="font-mono text-sm truncate"
                  />
                </div>
                <div className="flex items-center">
                   <Button onClick={handleSaveCron} size="md" variant="secondary" className="w-full sm:w-auto flex items-center justify-center gap-2">
                     <Save size={16} /> Actualizar
                   </Button>
                </div>
             </div>
             
             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between pt-2 border-t border-slate-100 dark:border-slate-800 ml-0">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full">
                  <span className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{active ? 'Servicio Activo' : 'Servicio Inactivo'}</span>
                </div>
                <button 
                  onClick={handleResetConfig}
                  className="text-xs flex items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 underline decoration-dotted underline-offset-2 transition-colors"
                >
                  <RotateCcw size={12} /> Restablecer valores
                </button>
             </div>
          </div>
        </Card>
        
        <Card title="Notificaciones Automáticas">
           <div className="flex items-center gap-2 mb-4 text-slate-500 dark:text-slate-400">
             <BellRing size={16} />
             <p className="text-sm">Configuración de alertas automáticas.</p>
          </div>

           <div className="space-y-3">
             <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-all active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-slate-900 dark:text-white">Recordatorio de Pago</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Enviar 3 días antes del vencimiento</div>
                  </div>
                </div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary/90 dark:bg-primary">
                  <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition shadow-sm"/>
                </div>
             </div>
             
             <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-all active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-300">
                    <Activity size={16} />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-slate-900 dark:text-white">Bienvenida a Nuevo Cliente</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Enviar al registrarse</div>
                  </div>
                </div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-600">
                  <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition shadow-sm"/>
                </div>
             </div>
           </div>
        </Card>

        {/* Sección de Ejecución Manual */}
        <Card title="Ejecución Manual" className="md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4 text-slate-500 dark:text-slate-400">
             <Play size={16} />
             <p className="text-sm">Ejecución inmediata de tareas.</p>
          </div>
          
          <div className="flex pb-4 sm:items-center flex-col sm:flex-row gap-4 mb-4 border-b border-slate-100 dark:border-slate-700">
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 w-full sm:w-auto">
               <div className={`w-5 h-5 rounded flex items-center justify-center border ${dryRun ? 'bg-primary border-primary text-white' : 'bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-600'}`}>
                 {dryRun && <CheckCircle size={14} />}
               </div>
               <input 
                 type="checkbox" 
                 checked={dryRun}
                 onChange={(e) => setDryRun(e.target.checked)}
                 className="hidden" // Custom checkbox styling
               />
               <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Modo Simulación</span>
            </label>
            <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 px-2 sm:px-0">
               <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" />
               <span>
                 {dryRun 
                   ? 'Solo contabiliza lo que se enviaría (No envía correos/WhatsApp).' 
                   : <span className="text-amber-600 dark:text-amber-400 font-medium">ATENCIÓN: Se enviarán mensajes REALES a los clientes.</span>
                 }
               </span>
            </div>
          </div>

          <Button 
            onClick={handleRunDaily}
            disabled={running}
            variant={dryRun ? 'secondary' : 'primary'}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-6 text-base shadow-sm"
          >
            {running ? <RefreshCw className="animate-spin" /> : <Play size={18} fill="currentColor" />}
            {running ? 'Ejecutando proceso...' : (dryRun ? 'Iniciar Simulación' : 'EJECUTAR ENVÍO REAL')}
          </Button>

          {logs && (
            <div className="mt-4 p-4 bg-slate-900 text-slate-300 rounded-lg border border-slate-700 text-xs font-mono overflow-auto max-h-60 shadow-inner">
               <div className="flex items-center gap-2 mb-2 text-slate-400 border-b border-slate-800 pb-2">
                 <Radio size={12} className="animate-pulse text-green-500"/>
                 <span className="uppercase tracking-wider text-[10px]">Console Output</span>
               </div>
               <pre className="whitespace-pre-wrap breakdown-all">{logs}</pre>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
