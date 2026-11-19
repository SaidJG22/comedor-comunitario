import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, hoyLocal } from '../../api/client.js';
import { useAviso } from '../../components/Avisos.jsx';
import { Cargando, Entrada, Lista, Mensajes } from '../../components/Campos.jsx';
import EncabezadoPagina from '../../components/EncabezadoPagina.jsx';
import NoDisponible from '../../components/NoDisponible.jsx';
import NuevoProducto from '../../components/NuevoProducto.jsx';
import Selector from '../../components/Selector.jsx';
import { useCarga } from '../../hooks/useCarga.js';
import { textoError } from '../../utils/errores.js';
import { capitalizar, fechaLegible, num } from '../../utils/formato.js';

const insumoVacio = { productoId: '', total: '' };

function FormMenu({ inicial, productos, onProductoCreado, onListo, onCancelar }) {
  const editando = Boolean(inicial.id);
  const [f, setF] = useState({
    fecha: inicial.fecha,
    servicio: inicial.servicio,
    nombrePlato: inicial.nombrePlato ?? '',
    raciones: inicial.raciones ?? '',
  });
  const [insumos, setInsumos] = useState(inicial.insumos?.length ? inicial.insumos : [{ ...insumoVacio }]);
  const [agregando, setAgregando] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const raciones = Number(f.raciones);
  const cambiarInsumo = (i, campo, valor) =>
    setInsumos((prev) => prev.map((x, idx) => (idx === i ? { ...x, [campo]: valor } : x)));
  const unidadDe = (id) => productos.find((p) => String(p.id) === String(id))?.unidad ?? '';
  const porRacion = (total) => (raciones > 0 ? Math.round((Number(total) / raciones) * 10000) / 10000 : 0);

  async function enviar(e) {
    e.preventDefault();
    setError('');
    const completos = insumos.filter((x) => x.productoId || x.total);
    if (completos.some((x) => !x.productoId || !(Number(x.total) > 0))) {
      setError('Cada insumo necesita un producto y una cantidad mayor a cero.');
      return;
    }
    if (completos.some((x) => porRacion(x.total) <= 0)) {
      setError('Una de las cantidades es demasiado chica para esa cantidad de raciones.');
      return;
    }
    setEnviando(true);
    try {
      const body = {
        fecha: f.fecha,
        servicio: f.servicio,
        nombrePlato: f.nombrePlato.trim(),
        racionesPlanificadas: raciones,
        insumos: completos.map((x) => ({ productoId: Number(x.productoId), cantidadPorRacion: porRacion(x.total) })),
      };
      await api(editando ? `/menus/${inicial.id}` : '/menus', { method: editando ? 'PUT' : 'POST', body });
      onListo(editando ? 'Menú actualizado.' : 'Menú planificado. Cuando lo confirmes, se descuentan los insumos de la despensa.', f.fecha);
    } catch (err) {
      setError(err.status === 409 && !editando ? 'Ya hay un menú para ese día y ese servicio. Editá el que ya existe.' : textoError(err));
    } finally {
      setEnviando(false);
    }
  }

  const opciones = productos.map((p) => ({ valor: String(p.id), texto: `${p.nombre} (${p.unidad})` }));

  return (
    <>
      <form onSubmit={enviar} aria-label={editando ? 'Editar menú' : 'Planificar menú'}>
        <Entrada label="Día" type="date" required value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} />
        <Selector valor={f.servicio} onChange={(servicio) => setF({ ...f, servicio })} />
        <Entrada label="¿Qué se cocina?" required maxLength={100} placeholder="Ej.: Guiso de lentejas" value={f.nombrePlato}
                 onChange={(e) => setF({ ...f, nombrePlato: e.target.value })} />
        <Entrada label="¿Para cuántas raciones?" type="number" inputMode="numeric" min="1" max="5000" required
                 value={f.raciones} onChange={(e) => setF({ ...f, raciones: e.target.value })} />

        <h3 className="sin-margen">¿Qué ingredientes se usan?</h3>
        <p className="tenue sin-margen">Escribí cuánto se usa <strong>en total</strong> para todas las raciones. Se descuentan de la despensa al confirmar el menú.</p>
        {insumos.map((x, i) => (
          <fieldset key={i}>
            <legend>Ingrediente {i + 1}</legend>
            <Lista label="Producto" opciones={opciones} value={x.productoId}
                   onChange={(e) => cambiarInsumo(i, 'productoId', e.target.value)} />
            <Entrada label={`Cantidad total${x.productoId ? ` (${unidadDe(x.productoId)})` : ''}`} type="number" inputMode="decimal"
                     min="0.0001" step="any" placeholder="Ej.: 6"
                     ayuda={x.productoId && Number(x.total) > 0 && raciones > 0 ? `Equivale a ${num(porRacion(x.total))} ${unidadDe(x.productoId)} por ración.` : undefined}
                     value={x.total} onChange={(e) => cambiarInsumo(i, 'total', e.target.value)} />
            {insumos.length > 1 && (
              <button type="button" className="btn-link oscuro" onClick={() => setInsumos((p) => p.filter((_, idx) => idx !== i))}>
                Quitar este ingrediente
              </button>
            )}
          </fieldset>
        ))}
        <button type="button" className="btn btn-outline-secondary" onClick={() => setInsumos((p) => [...p, { ...insumoVacio }])}>
          + Agregar otro ingrediente
        </button>

        <Mensajes error={error} />
        <div className="modal-pie">
          <button type="button" className="btn btn-outline-secondary" onClick={onCancelar}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar menú'}</button>
        </div>
      </form>

      <div className="separado">
        {agregando ? (
          <NuevoProducto onCancelar={() => setAgregando(false)}
                         onListo={(m, creado) => { setAgregando(false); onProductoCreado(m, creado); }} />
        ) : (
          <button type="button" className="btn-link oscuro" onClick={() => setAgregando(true)}>
            ¿Falta un producto en la lista? Agregalo acá
          </button>
        )}
      </div>
    </>
  );
}

/** Pantalla de menú */
export default function MenuFormPage() {
  const { id } = useParams();
  const editando = Boolean(id);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const avisar = useAviso();
  const productos = useCarga('/stock/productos');
  const menu = useCarga(editando ? `/menus/${id}` : null);
  const volverA = (fecha) => navigate(fecha ? `/semana?fecha=${fecha}` : '/semana');

  if (editando && !menu.datos) {
    return menu.error ? <NoDisponible mensaje={menu.error} volver={() => volverA()} textoVolver="Volver a la semana" /> : <Cargando />;
  }
  const m = menu.datos;
  if (editando && m.estado === 'confirmado') {
    return <NoDisponible mensaje={`"${m.nombre_plato}" ya está confirmado: descontó la despensa y no se puede editar.`} volver={() => volverA(m.fecha)} textoVolver="Volver a la semana" />;
  }
  const inicial = editando
    ? {
        id: m.id, fecha: m.fecha, servicio: m.servicio, nombrePlato: m.nombre_plato, raciones: String(m.raciones_planificadas),
        insumos: m.insumos.map((i) => ({ productoId: String(i.producto_id), total: String(Math.round(Number(i.cantidad_total) * 100) / 100) })),
      }
    : { fecha: params.get('fecha') || hoyLocal(), servicio: params.get('servicio') === 'merienda' ? 'merienda' : 'almuerzo' };

  return (
    <div className="form-pagina">
      <EncabezadoPagina
        nivel={2}
        titulo={editando ? `Editar "${m.nombre_plato}"` : 'Planificar menú'}
        descripcion={editando ? `${fechaLegible(m.fecha)} · ${capitalizar(m.servicio)}` : 'Qué se cocina, para cuántas raciones y con qué ingredientes.'}
      />
      <div className="panel">
        <FormMenu
          key={id ?? 'nuevo'}
          inicial={inicial}
          productos={productos.datos ?? []}
          onProductoCreado={(mensaje) => { avisar(mensaje); productos.recargar(); }}
          onCancelar={() => volverA(inicial.fecha)}
          onListo={(mensaje, fecha) => { avisar(mensaje); volverA(fecha); }}
        />
      </div>
    </div>
  );
}
