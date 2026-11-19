import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, hoyLocal } from '../../api/client.js';
import { useAviso } from '../../components/Avisos.jsx';
import { Cargando, Entrada, Lista, Mensajes } from '../../components/Campos.jsx';
import EncabezadoPagina from '../../components/EncabezadoPagina.jsx';
import NoDisponible from '../../components/NoDisponible.jsx';
import NuevoProducto from '../../components/NuevoProducto.jsx';
import { useCarga } from '../../hooks/useCarga.js';
import { textoError } from '../../utils/errores.js';
import { cantidad } from '../../utils/formato.js';

const itemVacio = { productoId: '', cantidad: '', fechaVencimiento: '' };

/** Formulario de donación */
function FormDonacion({ donacion, onListo, onCancelar }) {
  const editando = Boolean(donacion);
  const bloqueada = Boolean(donacion?.items.some((i) => Number(i.usado) > 0));
  const origenes = useCarga('/donaciones/origenes');
  const productos = useCarga('/stock/productos');
  const avisar = useAviso();
  const hoy = hoyLocal();

  const [origenId, setOrigenId] = useState(editando ? String(donacion.origen_id) : '');
  const [referencia, setReferencia] = useState(donacion?.referencia ?? '');
  const [fecha, setFecha] = useState(donacion?.fecha ?? hoy);
  const [items, setItems] = useState(() =>
    editando
      ? donacion.items.map((i) => ({ productoId: String(i.producto_id), cantidad: String(Number(i.cantidad)), fechaVencimiento: i.fecha_vencimiento ?? '' }))
      : [{ ...itemVacio }],
  );
  const [agregando, setAgregando] = useState(false);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cambiarItem = (i, campo, valor) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it)));
  const quitarItem = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  // Producto nuevo
  function productoCreado(mensaje, creado) {
    setAgregando(false);
    avisar(mensaje);
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
    const incompleto = items.findIndex((it) => !it.productoId || !(Number(it.cantidad) > 0));
    if (incompleto >= 0) {
      setError(`Completá el producto y una cantidad mayor a cero en el producto ${incompleto + 1}.`);
      return;
    }
    setGuardando(true);
    try {
      const body = {
        origenId: Number(origenId),
        referencia: referencia.trim() || undefined,
        fecha,
        items: items.map((it) => ({
          productoId: Number(it.productoId),
          cantidad: Number(it.cantidad),
          fechaVencimiento: it.fechaVencimiento || undefined,
        })),
      };
      await api(editando ? `/donaciones/${donacion.id}` : '/donaciones', { method: editando ? 'PUT' : 'POST', body });
      onListo(editando ? 'Donación corregida. La despensa ya refleja los cambios.' : 'Donación registrada. Los productos ya se sumaron a la despensa.');
    } catch (err) {
      setError(textoError(err));
    } finally {
      setGuardando(false);
    }
  }

  const opcionesOrigen = (origenes.datos ?? []).map((o) => ({ valor: String(o.id), texto: o.nombre }));
  const opcionesProducto = (productos.datos ?? []).map((p) => ({ valor: String(p.id), texto: `${p.nombre} (${p.unidad})` }));
  // Productos de baja
  for (const i of donacion?.items ?? []) {
    if (!opcionesProducto.some((o) => o.valor === String(i.producto_id))) {
      opcionesProducto.push({ valor: String(i.producto_id), texto: `${i.nombre} (${i.unidad})` });
    }
  }
  const sinProductos = !productos.cargando && !productos.error && (productos.datos ?? []).length === 0;

  return (
    <>
      <Mensajes error={origenes.error || productos.error} />
      {!bloqueada && sinProductos && !agregando && <p className="alert alert-warning aviso">Todavía no hay productos. Agregá el primero para poder registrar la donación.</p>}
      {!bloqueada && (agregando ? (
        <NuevoProducto onListo={productoCreado} onCancelar={() => setAgregando(false)} />
      ) : (
        <button type="button" className="btn btn-outline-secondary ancho" onClick={() => setAgregando(true)}>
          + Falta un producto en la lista
        </button>
      ))}
      <form onSubmit={guardar} aria-label={editando ? 'Corregir donación' : 'Registrar donación'}>
        <Lista label="¿Quién donó?" opciones={opcionesOrigen} value={origenId} required
               onChange={(e) => setOrigenId(e.target.value)} />
        <Entrada label="Referencia (opcional)" value={referencia} maxLength={100} placeholder="Ej.: panadería del barrio"
                 ayuda="No escribas datos de personas."
                 onChange={(e) => setReferencia(e.target.value)} />
        <Entrada label="¿Cuándo llegó?" type="date" required max={hoy} value={fecha}
                 onChange={(e) => setFecha(e.target.value)} />

        {bloqueada ? (
          <div className="alert alert-warning aviso">
            <p className="sin-margen">Parte de esta donación ya se usó, así que los productos no se pueden cambiar:</p>
            <ul>
              {donacion.items.map((i) => (
                <li key={i.id}>
                  {i.nombre}: {cantidad(i.cantidad, i.unidad)}
                  {Number(i.usado) > 0 && ` (ya se usaron ${cantidad(i.usado, i.unidad)})`}
                </li>
              ))}
            </ul>
            <p className="sin-margen">Podés corregir quién donó, la referencia y la fecha. Para las cantidades, usá “Corrección” en <strong>Lo que hay</strong>.</p>
          </div>
        ) : (
          <>
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
            <button type="button" className="btn btn-outline-secondary" onClick={() => setItems((p) => [...p, { ...itemVacio }])}>
              + Agregar otro producto a esta donación
            </button>
          </>
        )}

        <Mensajes error={error} />
        <div className="modal-pie">
          <button type="button" className="btn btn-outline-secondary" onClick={onCancelar}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Guardar donación'}
          </button>
        </div>
      </form>
    </>
  );
}

/** Pantalla de donación */
export default function DonacionFormPage() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const avisar = useAviso();
  const donacion = useCarga(editando ? `/donaciones/${id}` : null);
  const volver = () => navigate(editando ? `/despensa/donaciones/${id}` : '/despensa/donaciones');

  if (editando && !donacion.datos) {
    return donacion.error ? <NoDisponible mensaje={donacion.error} volver={() => navigate('/despensa/donaciones')} /> : <Cargando />;
  }

  return (
    <div className="form-pagina">
      <EncabezadoPagina
        nivel={2}
        titulo={editando ? 'Corregir donación' : 'Registrar donación'}
        descripcion={editando ? 'Si nada se usó todavía, podés cambiar todo; la despensa se ajusta sola.' : 'Lo que llega se suma a la despensa automáticamente.'}
      />
      <div className="panel">
        <FormDonacion
          key={id ?? 'nueva'}
          donacion={donacion.datos ?? undefined}
          onListo={(mensaje) => { avisar(mensaje); navigate('/despensa/donaciones'); }}
          onCancelar={volver}
        />
      </div>
    </div>
  );
}
