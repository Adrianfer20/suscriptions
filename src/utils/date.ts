export const getDaysUntilCut = (cutDate?: string): number | "-" => {
  if (!cutDate) return '-'
  
  // Crear fechas usando fechas de solo fecha (sin hora) para evitar problemas de timezone
  const today = new Date()
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  const [year, month, day] = cutDate.split('-').map(Number)
  const cutDateOnly = new Date(year, month - 1, day)
  
  const diff = cutDateOnly.getTime() - todayDate.getTime()
  if (isNaN(diff)) return '-'
  
  // Dividir y redondear (no ceil, para obtener días completos restantes)
  const days = Math.round(diff / (1000 * 60 * 60 * 24))
  return days
}

export const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  const [year, month, day] = dateStr.split('-')
  const meses = [
    'enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'
  ]
  const mesNombre = meses[parseInt(month, 10) - 1] || ''
  return `${parseInt(day, 10)} de ${mesNombre} de ${year}`
}
