// Texto del error
export const mensajeError = (err) => {
  if (!err.response) {
    return 'No hay conexión con el servidor.'
  }
  const datos = err.response.data
  if (datos.errors) {
    return datos.errors.map((e) => e.message).join('. ')
  }
  if (datos.detalles && datos.detalles.disponible !== undefined) {
    return `No alcanza el stock: hay ${datos.detalles.disponible} y se necesitan ${datos.detalles.solicitado}.`
  }
  return datos.error || 'Ocurrió un error.'
}
