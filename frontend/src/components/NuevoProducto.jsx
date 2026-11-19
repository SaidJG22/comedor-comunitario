import { useState } from 'react';
import { api } from '../api/client.js';
import { useCarga } from '../hooks/useCarga.js';
import { textoError } from '../utils/errores.js';
import { Entrada, Lista, Mensajes } from './Campos.jsx';

const UNIDADES = [
  { valor: 'kg', texto: 'kilos (kg)' },
  { valor: 'g', texto: 'gramos (g)' },
  { valor: 'l', texto: 'litros (l)' },
  { valor: 'ml', texto: 'mililitros (ml)' },
  { valor: 'unidad', texto: 'unidades' },
];

/** Formulario de producto */
export default function NuevoProducto({ producto, onListo, onCancelar, enPagina = false }) {
  const editando = Boolean(producto);
  const categorias = useCarga('/stock/categorias');
  const [f, setF] = useState(() =>
    editando
      ? {
          nombre: producto.nombre,
          categoriaId: producto.categoria_id ? String(producto.categoria_id) : '',
          unidad: producto.unidad,
          stockMinimo: String(producto.stock_minimo ?? 0),
        }
      : { nombre: '', categoriaId: '', unidad: 'kg', stockMinimo: '0' },
  );
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    const nombre = f.nombre.trim();
    try {
      if (editando) {
        await api(`/stock/productos/${producto.id}`, {
          method: 'PUT',
          body: { nombre, categoriaId: f.categoriaId ? Number(f.categoriaId) : null, stockMinimo: Number(f.stockMinimo) || 0 },
        });
        onListo(`Se guardaron los cambios de "${nombre}".`);
      } else {
        const creado = await api('/stock/productos', {
          method: 'POST',
          body: {
            nombre,
            categoriaId: f.categoriaId ? Number(f.categoriaId) : undefined,
            unidad: f.unidad,
            stockMinimo: Number(f.stockMinimo) || 0,
          },
        });
        onListo(`Se agregó "${nombre}" a la despensa.`, creado);
      }
    } catch (err) {
      setError(err.status === 409 ? 'Ya hay un producto con ese nombre (puede estar dado de baja).' : textoError(err));
    } finally {
      setEnviando(false);
    }
  }

  const textoGuardar = enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Guardar producto';

  return (
    <form className={enPagina ? undefined : 'panel'} onSubmit={enviar} aria-label={editando ? `Editar ${producto.nombre}` : 'Nuevo producto'}>
      {!enPagina && <h2>Nuevo producto</h2>}
      <Entrada label="Nombre" value={f.nombre} maxLength={80} required placeholder="Ej.: Arroz"
               onChange={(e) => setF({ ...f, nombre: e.target.value })} />
      <Lista label="Categoría (opcional)" vacio="Sin categoría"
             opciones={(categorias.datos ?? []).map((c) => ({ valor: String(c.id), texto: c.nombre }))}
             value={f.categoriaId} onChange={(e) => setF({ ...f, categoriaId: e.target.value })} />
      <Lista label="Se mide en" opciones={UNIDADES} vacio="" value={f.unidad} disabled={editando}
             ayuda={editando ? 'La unidad no se puede cambiar: ya hay movimientos cargados en esta unidad.' : undefined}
             onChange={(e) => setF({ ...f, unidad: e.target.value })} />
      <Entrada label="Avisarme cuando quede menos de" type="number" inputMode="decimal" min="0" step="any"
               ayuda="Cuando quede esa cantidad o menos, el producto aparece en las alertas. Podés dejar 0."
               value={f.stockMinimo} onChange={(e) => setF({ ...f, stockMinimo: e.target.value })} />
      <Mensajes error={error} />
      {enPagina ? (
        <div className="modal-pie">
          <button type="button" className="btn btn-outline-secondary" onClick={onCancelar}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={enviando}>{textoGuardar}</button>
        </div>
      ) : (
        <>
          <button type="submit" className="btn btn-primary" disabled={enviando}>{textoGuardar}</button>
          {onCancelar && <button type="button" className="btn-link oscuro" onClick={onCancelar}>Cancelar</button>}
        </>
      )}
    </form>
  );
}
