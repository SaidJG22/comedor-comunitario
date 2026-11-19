// Fechas
const aFecha = (iso) => new Date(`${iso}T12:00:00`);

const aIso = (d) => d.toLocaleDateString('sv-SE');

export const capitalizar = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export function sumarDias(iso, n) {
  const d = aFecha(iso);
  d.setDate(d.getDate() + n);
  return aIso(d);
}

export function lunesDe(iso) {
  const diaSemana = (aFecha(iso).getDay() + 6) % 7; // lunes = 0
  return sumarDias(iso, -diaSemana);
}

export function semanaDe(iso) {
  const lunes = lunesDe(iso);
  return {
    desde: lunes,
    hasta: sumarDias(lunes, 6),
    dias: Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i)),
  };
}

export function mesDe(iso) {
  const d = aFecha(iso);
  return {
    desde: aIso(new Date(d.getFullYear(), d.getMonth(), 1, 12)),
    hasta: aIso(new Date(d.getFullYear(), d.getMonth() + 1, 0, 12)),
  };
}

export const fechaLegible = (iso) =>
  capitalizar(aFecha(iso).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }));

export const fechaCorta = (iso) => aFecha(iso).toLocaleDateString('es-AR');

export const num = (n) => Number(n ?? 0).toLocaleString('es-AR', { maximumFractionDigits: 2 });

/** Sin tildes */
const normalizar = (t) => String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Coincidencia */
export const coincide = (busqueda, ...textos) => textos.some((t) => normalizar(t).includes(normalizar(busqueda)));

/** Cantidad con unidad */
export const cantidad = (n, unidad) =>
  `${num(n)} ${unidad === 'unidad' && Number(n) !== 1 ? 'unidades' : unidad}`;
