const ZONA = 'America/Argentina/Tucuman';

/** Fecha de hoy (AAAA-MM-DD) en la zona horaria del comedor. */
export function hoy() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: ZONA });
}
