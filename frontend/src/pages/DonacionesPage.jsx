import { useState } from 'react';
import { api, hoyLocal } from '../api/client.js';
import AyudaPlegable from '../components/AyudaPlegable.jsx';
import { Cargando, Entrada, Lista, Mensajes, Vacio } from '../components/Campos.jsx';
import NuevoProducto from '../components/NuevoProducto.jsx';
import { useCarga } from '../hooks/useCarga.js';
import { textoError } from '../utils/errores.js';
import { fechaCorta } from '../utils/formato.js';

const itemVacio = { productoId: '', cantidad: '', fechaVencimiento: '' };

export default function DonacionesPage() {
  const origenes = useCarga('/donaciones/origenes');
  const productos = useCarga('/stock/productos');
  const recientes = useCarga('/donaciones');

  const [origenId, setOrigenId] = useState('');
  const [referencia, setReferencia] = useState('');
  const [items, setItems] = useState([{ ...itemVacio }]);
  const [agregando, setAgregando] = useState(false);
  const [ok, setOk] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cambiarItem = (i, campo, valor) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it)));
  const quitarItem = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  // Un producto recién creado queda elegido en el primer renglón que esté sin producto.
  function productoCreado(mensaje, creado) {
    setAgregando(false);
    setOk(mensaje);
    productos.recargar();
    if (creado?.id) {
      setItems((prev) => {
        const libre = prev.findIndex((it) => !it.productoId);
        return prev.map((it, idx) => (idx === (libre >= 0 ? libre : prev.length - 1) ? { ...it, productoId: String(creado.id) } : it));
      });
    }
  }

  async function guardar(e) {
    e.preventDefault();
    setError('');
    setOk('');

    const incompleto = items.findIndex((it) => !it.productoId || !(Number(it.cantidad) > 0));
    if (incompleto >= 0) {
      setError(`Completá el producto y una cantidad mayor a cero en el producto ${incompleto + 1}.`);
      return;
    }

    setGuardando(true);
    try {
      await api('/donaciones', {
        method: 'POST',
        body: {
          origenId: Number(origenId),
          referencia: referencia.trim() || undefined,
          fecha: hoyLocal(),
          items: items.map((it) => ({
            productoId: Number(it.productoId),
            cantidad: Number(it.cantidad),
            fechaVencimiento: it.fechaVencimiento || undefined,
          })),
        },
      });
      setOk('Donación registrada. Los productos ya se sumaron a la despensa.');
      setItems([{ ...itemVacio }]);
      setReferencia('');
      recientes.recargar();
      productos.recargar();
    } catch (err) {
      setError(textoError(err));
    } finally {
      setGuardando(false);
    }
  }

  const opcionesOrigen = (origenes.datos ?? []).map((o) => ({ valor: String(o.id), texto: o.nombre }));
  const opcionesProducto = (productos.datos ?? []).map((p) => ({ valor: String(p.id), texto: `${p.nombre} (${p.unidad})` }));
  const listaReciente = (recientes.datos ?? []).slice(0, 10);
  const sinProductos = !productos.cargando && !productos.error && (productos.datos ?? []).length === 0;

  return (
    <div>
      <h2>Registrar una donación</h2>
      <p className="sub">Lo que llega se suma a la despensa automáticamente.</p>
      <AyudaPlegable>
        <ol>
          <li>Elegí quién donó (Estado, Banco de Alimentos, un particular o un comercio).</li>
          <li>Elegí el producto y escribí cuánto llegó. Si no está en la lista, agregalo con <strong>Falta un producto</strong>.</li>
          <li>Tocá <strong>Guardar donación</strong>. No hace falta cargar nombres de personas.</li>
          <li>Si cargaste una cantidad de más, corregila en <strong>Lo que hay</strong> con la opción “Corrección”.</li>
        </ol>
      </AyudaPlegable>
      <Mensajes error={origenes.error || productos.error} />

      {sinProductos && !agregando && <Vacio>Todavía no hay productos. Agregá el primero para poder registrar la donación.</Vacio>}
      {agregando ? (
        <NuevoProducto onListo={productoCreado} onCancelar={() => setAgregando(false)} />
      ) : (
        <button type="button" className="btn-sec ancho" onClick={() => { setOk(''); setAgregando(true); }}>
          + Falta un producto en la lista
        </button>
      )}

      <form onSubmit={guardar}>
        <Lista label="¿Quién donó?" opciones={opcionesOrigen} value={origenId} required
               onChange={(e) => setOrigenId(e.target.value)} />
        <Entrada label="Referencia (opcional)" value={referencia} maxLength={100} placeholder="Ej.: panadería del barrio"
                 ayuda="No escribas datos de personas."
                 onChange={(e) => setReferencia(e.target.value)} />

        {items.map((it, i) => (
          <fieldset key={i}>
            <legend>Producto {i + 1}</legend>
            <Lista label="Producto" opciones={opcionesProducto} value={it.productoId} required
                   onChange={(e) => cambiarItem(i, 'productoId', e.target.value)} />
            <Entrada label="¿Cuánto llegó?" type="number" inputMode="decimal" min="0.01" step="any" required
                     value={it.cantidad} onChange={(e) => cambiarItem(i, 'cantidad', e.target.value)} />
            <Entrada label="Fecha de vencimiento (si tiene)" type="date" value={it.fechaVencimiento}
                     onChange={(e) => cambiarItem(i, 'fechaVencimiento', e.target.value)} />
            {items.length > 1 && (
              <button type="button" className="btn-link oscuro" onClick={() => quitarItem(i)}>
                Quitar este producto
              </button>
            )}
          </fieldset>
        ))}
        <button type="button" className="btn-sec" onClick={() => setItems((p) => [...p, { ...itemVacio }])}>
          + Agregar otro producto a esta donación
        </button>

        <Mensajes error={error} ok={ok} />
        <button type="submit" className="btn" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar donación'}
        </button>
      </form>

      <h3 className="seccion">Últimas donaciones</h3>
      {recientes.cargando && <Cargando />}
      {recientes.error && <Mensajes error={recientes.error} />}
      <ul className="lista">
        {listaReciente.map((d) => (
          <li key={d.id}>
            <span>
              {fechaCorta(d.fecha)} · {d.origen}
              {d.referencia ? ` (${d.referencia})` : ''}
            </span>
            <span>{d.cantidad_items} {Number(d.cantidad_items) === 1 ? 'producto' : 'productos'}</span>
          </li>
        ))}
      </ul>
      {!recientes.cargando && !recientes.error && listaReciente.length === 0 && (
        <Vacio>Todavía no se registraron donaciones.</Vacio>
      )}
    </div>
  );
}
