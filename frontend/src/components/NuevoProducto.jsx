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

/**
 * Alta de un producto de la despensa. Se usa en Existencias, en Donaciones y en el menú,
 * para no obligar a salir de la pantalla. `onListo(mensaje, producto)` avisa el resultado.
 */
export default function NuevoProducto({ onListo, onCancelar }) {
  const categorias = useCarga('/stock/categorias');
  const [f, setF] = useState({ nombre: '', categoriaId: '', unidad: 'kg', stockMinimo: '0' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const creado = await api('/stock/productos', {
        method: 'POST',
        body: {
          nombre: f.nombre.trim(),
          categoriaId: f.categoriaId ? Number(f.categoriaId) : undefined,
          unidad: f.unidad,
          stockMinimo: Number(f.stockMinimo) || 0,
        },
      });
      onListo(`Se agregó "${f.nombre.trim()}" a la despensa.`, creado);
    } catch (err) {
      setError(err.status === 409 ? 'Ya hay un producto con ese nombre.' : textoError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="panel" onSubmit={enviar} aria-label="Nuevo producto">
      <h2>Nuevo producto</h2>
      <Entrada label="Nombre" value={f.nombre} maxLength={80} required placeholder="Ej.: Arroz"
               onChange={(e) => setF({ ...f, nombre: e.target.value })} />
      <Lista label="Categoría (opcional)" vacio="Sin categoría"
             opciones={(categorias.datos ?? []).map((c) => ({ valor: String(c.id), texto: c.nombre }))}
             value={f.categoriaId} onChange={(e) => setF({ ...f, categoriaId: e.target.value })} />
      <Lista label="Se mide en" opciones={UNIDADES} vacio="" value={f.unidad}
             onChange={(e) => setF({ ...f, unidad: e.target.value })} />
      <Entrada label="Avisarme cuando quede menos de" type="number" inputMode="decimal" min="0" step="any"
               ayuda="Cuando quede esa cantidad o menos, el producto aparece en las alertas. Podés dejar 0."
               value={f.stockMinimo} onChange={(e) => setF({ ...f, stockMinimo: e.target.value })} />
      <Mensajes error={error} />
      <button type="submit" className="btn" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar producto'}</button>
      {onCancelar && <button type="button" className="btn-link oscuro" onClick={onCancelar}>Cancelar</button>}
    </form>
  );
}
