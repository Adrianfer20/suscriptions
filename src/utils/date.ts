export const getDaysUntilCut = (cutDate?: string): number | "-" => {
  if (!cutDate) return '-'
  const today = new Date()
  const [year, month, day] = cutDate.split('-').map(Number)
  const cut = new Date(year, month - 1, day)
  const diff = cut.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  if (isNaN(diff)) return '-'
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
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
