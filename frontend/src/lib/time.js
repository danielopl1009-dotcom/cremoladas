/**
 * Utilidades de tiempo para zona horaria de Perú (America/Lima, UTC-5).
 * Todos los timestamps vienen del servidor en UTC.
 * Estas funciones los convierten correctamente a hora peruana.
 */

const TZ = 'America/Lima';

/**
 * Formatea un timestamp a hora peruana: "14:32"
 */
export function formatHoraPE(ts) {
  if (!ts) return null;
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: TZ,
    hour:     '2-digit',
    minute:   '2-digit',
    hour12:   false,
  }).format(new Date(ts));
}

/**
 * Formatea fecha completa peruana: "jue. 10 sep. 14:32"
 */
export function formatFechaPE(ts) {
  if (!ts) return null;
  return new Intl.DateTimeFormat('es-PE', {
    timeZone:   TZ,
    weekday:    'short',
    day:        'numeric',
    month:      'short',
    hour:       '2-digit',
    minute:     '2-digit',
    hour12:     false,
  }).format(new Date(ts));
}

/**
 * Diferencia en minutos entre dos timestamps (siempre positivo).
 */
export function minutosBetween(from, to) {
  if (!from || !to) return null;
  const diff = Math.floor((new Date(to).getTime() - new Date(from).getTime()) / 60000);
  return diff >= 0 ? diff : null;
}

/**
 * Tiempo relativo en español: "hace 3 minutos", "hace 1 hora"
 * Calcula correctamente sin depender del TZ del navegador.
 */
export function tiempoRelativo(ts) {
  if (!ts) return '';
  const diffMs   = Date.now() - new Date(ts).getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1)  return 'ahora mismo';
  if (diffMins < 60) return `hace ${diffMins} min`;

  const hrs = Math.floor(diffMins / 60);
  const rem = diffMins % 60;
  if (hrs < 24) return rem > 0 ? `hace ${hrs}h ${rem}min` : `hace ${hrs}h`;

  const days = Math.floor(hrs / 24);
  return `hace ${days}d`;
}

/**
 * Color de alerta según minutos de espera.
 */
export function colorEspera(mins) {
  if (mins === null || mins === undefined) return 'text-surface-400';
  if (mins > 15) return 'text-red-500 font-bold';
  if (mins > 8)  return 'text-amber-500 font-semibold';
  return 'text-emerald-600 font-medium';
}
