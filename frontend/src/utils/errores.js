import { num } from './formato.js';

/**
 * Convierte un error de la API en un texto claro para la persona usuaria.
 * - 409 de stock insuficiente: nombra el producto y las cantidades.
 * - 400 de validación: agrega el detalle de los campos.
 */
export function textoError(err, productos = []) {
  const d = err?.detalles;
  if (err?.status === 409 && d && !Array.isArray(d) && d.disponible !== undefined) {
    const nombre = productos.find((p) => p.id === d.productoId)?.nombre ?? 'un producto';
    return `No alcanza el stock de ${nombre}: hay ${num(d.disponible)} y se necesitan ${num(d.solicitado)}.`;
  }
  if (Array.isArray(d) && d.length > 0) {
    return `${err.message}: ${d.map((x) => x.mensaje).join('; ')}`;
  }
  return err?.message ?? 'Ocurrió un error inesperado';
}
