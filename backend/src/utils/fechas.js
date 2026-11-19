const ZONA = 'America/Argentina/Tucuman';

/** Fecha de hoy */
export function hoy() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: ZONA });
}
