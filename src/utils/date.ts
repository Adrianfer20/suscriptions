// timezone de Caracas: UTC-4
const CARACAS_OFFSET_HOURS = -4;

export const getDaysUntilCut = (cutDate?: string): number | "-" => {
  if (!cutDate) return '-'
  
  // Obtener la fecha actual en timezone de Caracas
  const now = new Date();
  const nowInCaracas = new Date(now.getTime() + CARACAS_OFFSET_HOURS * 60 * 60 * 1000);
  
  // Crear fecha de corte
  const [year, month, day] = cutDate.split('-').map(Number);
  const cutDateOnly = new Date(year, month - 1, day);
  
  // Calcular diferencia en días (sin hora)
  const todayDate = new Date(nowInCaracas.getFullYear(), nowInCaracas.getMonth(), nowInCaracas.getDate());
  const diff = cutDateOnly.getTime() - todayDate.getTime();
  
  if (isNaN(diff)) return '-';
  
  // Dividir por milisegundos en un día
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days;
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
