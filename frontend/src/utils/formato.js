// Fecha de hoy
export const hoy = () => new Date().toLocaleDateString('sv-SE')

const aFecha = (iso) => new Date(`${iso}T12:00:00`)

export const sumarDias = (iso, dias) => {
  const fecha = aFecha(iso)
  fecha.setDate(fecha.getDate() + dias)
  return fecha.toLocaleDateString('sv-SE')
}

// Lunes de la semana
export const lunesDe = (iso) => sumarDias(iso, -((aFecha(iso).getDay() + 6) % 7))

export const diasDeLaSemana = (lunes) => [0, 1, 2, 3, 4, 5, 6].map((n) => sumarDias(lunes, n))

export const inicioDeMes = (iso) => `${iso.slice(0, 7)}-01`

export const fechaCorta = (iso) => aFecha(iso).toLocaleDateString('es-AR')

export const fechaLarga = (iso) => {
  const texto = aFecha(iso).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  return texto[0].toUpperCase() + texto.slice(1)
}

// Cantidad con unidad
export const cantidad = (n, unidad) => `${Number(n)} ${unidad === 'unidad' ? 'unidades' : unidad}`
