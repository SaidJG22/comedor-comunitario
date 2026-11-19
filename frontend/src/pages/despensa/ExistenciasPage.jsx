import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, hoyLocal } from '../../api/client.js';
import { GESTION, ROLES } from '../../auth/roles.js';
import { useSesion } from '../../store/sesion.js';
import AccionesFila from '../../components/AccionesFila.jsx';
import AyudaPlegable from '../../components/AyudaPlegable.jsx';
import { useAviso } from '../../components/Avisos.jsx';
import { Cargando, Entrada, Lista, Mensajes, Vacio } from '../../components/Campos.jsx';
import Buscador from '../../components/Buscador.jsx';
import { useConfirmar } from '../../components/Confirmar.jsx';
import EncabezadoPagina from '../../components/EncabezadoPagina.jsx';
import FiltroOpciones from '../../components/FiltroOpciones.jsx';
import Icono from '../../components/Iconos.jsx';
import Modal from '../../components/Modal.jsx';
import Selector from '../../components/Selector.jsx';
import { useCarga } from '../../hooks/useCarga.js';
import { textoError } from '../../utils/errores.js';
import { cantidad, coincide, fechaCorta } from '../../utils/formato.js';

const TIPOS = [
  { valor: 'ingreso', texto: 'Llegó mercadería' },
  { valor: 'egreso', texto: 'Se usó o se descartó' },
];
const MOTIVOS = {
  ingreso: [
    { valor: 'compra', texto: 'La compramos' },
    { valor: 'ajuste', texto: 'Corrección (conté y había más)' },
  ],
  egreso: [
    { valor: 'consumo', texto: 'Se usó en la cocina' },
    { valor: 'merma', texto: 'Se descartó (vencido o dañado)' },
    { valor: 'ajuste', texto: 'Corrección (conté y había menos)' },
  ],
};

function FormMovimiento({ producto, productos, onListo, onCancelar }) {
  const [f, setF] = useState({ tipo: 'ingreso', motivo: 'compra', cantidad: '', vencimiento: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cambiarTipo = (tipo) => setF({ ...f, tipo, motivo: MOTIVOS[tipo][0].valor });

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await api('/stock/movimientos', {
        method: 'POST',
        body: {
          productoId: producto.id,
          tipo: f.tipo,
          motivo: f.motivo,
          cantidad: Number(f.cantidad),
          fecha: hoyLocal(),
          fechaVencimiento: f.tipo === 'ingreso' && f.vencimiento ? f.vencimiento : undefined,
        },
      });
      onListo(`${f.tipo === 'ingreso' ? 'Se sumaron' : 'Se restaron'} ${cantidad(f.cantidad, producto.unidad)} de ${producto.nombre}.`);
    } catch (err) {
      setError(textoError(err, productos));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} aria-label={`Movimiento de ${producto.nombre}`}>
      <p className="tenue sin-margen">Ahora hay <strong>{cantidad(producto.stock_actual, producto.unidad)}</strong>.</p>
      <Selector etiqueta="Tipo de movimiento" opciones={TIPOS} valor={f.tipo} onChange={cambiarTipo} />
      <Entrada label={`¿Cuánto? (${producto.unidad})`} type="number" inputMode="decimal" min="0.01" step="any"
               required value={f.cantidad} onChange={(e) => setF({ ...f, cantidad: e.target.value })} />
      <Lista label="¿Por qué?" opciones={MOTIVOS[f.tipo]} vacio="" value={f.motivo}
             onChange={(e) => setF({ ...f, motivo: e.target.value })} />
      {f.tipo === 'ingreso' && (
        <Entrada label="Fecha de vencimiento (si tiene)" type="date" value={f.vencimiento}
                 onChange={(e) => setF({ ...f, vencimiento: e.target.value })} />
      )}
      <Mensajes error={error} />
      <div className="modal-pie">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar movimiento'}</button>
      </div>
    </form>
  );
}

const SIN_CATEGORIA = 'sin';
const claveCategoria = (p) => (p.categoria_id ? String(p.categoria_id) : SIN_CATEGORIA);

/** Opciones del filtro */
function opcionesCategoria(lista) {
  const grupos = new Map();
  for (const p of lista) {
    const clave = claveCategoria(p);
    const grupo = grupos.get(clave) ?? { valor: clave, texto: p.categoria ?? 'Sin categoría', cantidad: 0 };
    grupo.cantidad += 1;
    grupos.set(clave, grupo);
  }
  const ordenadas = [...grupos.values()].sort(
    (a, b) => (a.valor === SIN_CATEGORIA) - (b.valor === SIN_CATEGORIA) || a.texto.localeCompare(b.texto, 'es'),
  );
  return [{ valor: '', texto: 'Todas', cantidad: lista.length }, ...ordenadas];
}

export default function ExistenciasPage() {
  const { usuario } = useSesion();
  const gestion = GESTION.includes(usuario.rol);
  const esAdmin = usuario.rol === ROLES.ADMIN;
  const productos = useCarga('/stock/productos');
  const alertas = useCarga('/stock/alertas?dias=7');
  const avisar = useAviso();
  const confirmar = useConfirmar();
  const navigate = useNavigate();
  const [movimientoDe, setMovimientoDe] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');

  const lista = productos.datos ?? [];
  const opciones = opcionesCategoria(lista);
  // Filtrado
  const texto = busqueda.trim();
  const filtrando = Boolean(texto || categoria);
  const visibles = filtrando
    ? lista.filter((p) => (!categoria || claveCategoria(p) === categoria) && (!texto || coincide(texto, p.nombre, p.categoria)))
    : lista;
  const total = `${lista.length} ${lista.length === 1 ? 'producto' : 'productos'}`;
  const enCategoria = !categoria ? '' : categoria === SIN_CATEGORIA ? ' sin categoría' : ` en ${opciones.find((o) => o.valor === categoria)?.texto ?? 'esa categoría'}`;
  const quitarFiltros = () => {
    setBusqueda('');
    setCategoria('');
  };
  const { stockBajo = [], porVencer = [] } = alertas.datos ?? {};
  const bajo = new Set(stockBajo.map((p) => p.id));
  const seleccionado = movimientoDe ? lista.find((p) => p.id === movimientoDe) : null;
  const cerrar = () => setMovimientoDe(null);
  const nuevo = () => navigate('/despensa/existencias/nuevo');

  function recargar() {
    productos.recargar();
    alertas.recargar();
  }

  function listo(mensaje) {
    setMovimientoDe(null);
    avisar(mensaje);
    recargar();
  }

  async function darDeBaja(p) {
    const si = await confirmar({
      titulo: `¿Dar de baja "${p.nombre}"?`,
      mensaje: 'Deja de aparecer en la despensa y en las listas para elegir. Lo que ya se registró con este producto se conserva.',
      textoSi: 'Sí, dar de baja',
      peligro: true,
    });
    if (!si) return;
    try {
      await api(`/stock/productos/${p.id}`, { method: 'PATCH', body: { activo: false } });
      avisar(`"${p.nombre}" se dio de baja.`);
      recargar();
    } catch (err) {
      avisar(textoError(err), 'error');
    }
  }

  // Solo sin historial
  async function borrar(p) {
    const si = await confirmar({
      titulo: `¿Borrar "${p.nombre}"?`,
      mensaje: 'Se borra definitivamente: todavía no tiene movimientos ni se usa en menús o donaciones.',
      textoSi: 'Sí, borrar',
      peligro: true,
    });
    if (!si) return;
    try {
      await api(`/stock/productos/${p.id}`, { method: 'DELETE' });
      avisar(`Se borró "${p.nombre}".`);
      recargar();
    } catch (err) {
      avisar(textoError(err), 'error');
    }
  }

  return (
    <div>
      <EncabezadoPagina
        nivel={2}
        titulo="Lo que hay en la despensa"
        descripcion={productos.datos ? (filtrando ? `${visibles.length} de ${total}` : total) : undefined}
        accion={gestion ? { texto: 'Nuevo producto', onClick: nuevo } : undefined}
      />
      <AyudaPlegable>
        <ol>
          <li>Para encontrar un producto rápido, escribí parte del nombre en <strong>Buscar producto</strong> o tocá una <strong>categoría</strong> (por ejemplo, Secos).</li>
          {esAdmin && <li>Con <strong>Editar categorías</strong> agregás, cambiás o borrás categorías.</li>}
          <li>Agregá cada producto una sola vez con <strong>Nuevo producto</strong>.</li>
          <li>Cuando llega o se usa mercadería, tocá <strong>Llegó / se usó</strong> en ese producto.</li>
          <li>Con <strong>Editar</strong> cambiás el nombre, la categoría o el mínimo. <strong>Dar de baja</strong> lo saca de la lista (tiene que estar en 0). Un producto que todavía no se usó se puede <strong>Borrar</strong>.</li>
          <li>Lo que llega por donación se suma solo desde la pestaña <strong>Donaciones</strong>.</li>
          <li>Si te equivocaste en una cantidad, corregila con la opción <strong>Corrección</strong>: así queda registrado.</li>
        </ol>
      </AyudaPlegable>
      <Mensajes error={productos.error || alertas.error} />

      {(stockBajo.length > 0 || porVencer.length > 0) && (
        <div className="alert alert-warning alertas" role="region" aria-label="Alertas de stock">
          <h3><Icono nombre="alerta" tamano={20} /> Atención</h3>
          <ul>
            {stockBajo.map((p) => (
              <li key={`b${p.id}`}>
                Queda poco <strong>{p.nombre}</strong>: {cantidad(p.stock_actual, p.unidad)}
              </li>
            ))}
            {porVencer.map((l) => (
              <li key={`v${l.lote_id}`}>
                <strong>{l.nombre}</strong>{' '}
                {l.dias_restantes < 0
                  ? `venció el ${fechaCorta(l.fecha_vencimiento)}`
                  : l.dias_restantes === 0
                    ? 'vence hoy'
                    : `vence en ${l.dias_restantes} ${l.dias_restantes === 1 ? 'día' : 'días'}`}{' '}
                ({cantidad(l.cantidad_actual, l.unidad)})
              </li>
            ))}
          </ul>
        </div>
      )}

      {productos.cargando && !productos.datos && <Cargando />}
      {lista.length > 0 && (
        <>
          <Buscador etiqueta="Buscar producto" valor={busqueda} onChange={setBusqueda} placeholder="Nombre o categoría" />
          <FiltroOpciones etiqueta="Categoría" opciones={opciones} valor={categoria} onChange={setCategoria}
                          extra={esAdmin && <Link to="/despensa/categorias" className="btn-link oscuro">Editar categorías</Link>} />
        </>
      )}
      <ul className="lista">
        {visibles.map((p) => {
          const esBajo = bajo.has(p.id);
          return (
            <li key={p.id} className={`fila${esBajo ? ' bajo' : ''}`}>
              <div className="fila-info">
                <span className="fila-titulo">
                  {p.nombre}
                  {esBajo && <span className="badge rounded-pill insignia peligro">{Number(p.stock_actual) > 0 ? 'Bajo mínimo' : 'Sin stock'}</span>}
                </span>
                <span className="fila-detalle">
                  {p.categoria ?? 'Sin categoría'} · Mínimo: {cantidad(p.stock_minimo, p.unidad)}
                </span>
              </div>
              <span className="fila-dato">{cantidad(p.stock_actual, p.unidad)}</span>
              {gestion && (
                <AccionesFila
                  acciones={[
                    { texto: 'Llegó / se usó', icono: 'movimiento', primario: true, etiqueta: `Registrar llegada o uso de ${p.nombre}`,
                      onClick: () => setMovimientoDe(p.id) },
                    { texto: 'Editar', icono: 'editar', etiqueta: `Editar ${p.nombre}`, onClick: () => navigate(`/despensa/existencias/${p.id}/editar`) },
                    Number(p.tiene_historial)
                      ? { texto: 'Dar de baja', icono: 'baja', peligro: true, etiqueta: `Dar de baja ${p.nombre}`, onClick: () => darDeBaja(p) }
                      : { texto: 'Borrar', icono: 'borrar', peligro: true, etiqueta: `Borrar ${p.nombre}`, onClick: () => borrar(p) },
                  ]}
                />
              )}
            </li>
          );
        })}
      </ul>
      {lista.length > 0 && visibles.length === 0 && (
        <Vacio icono="buscar" accion={{ texto: 'Quitar filtros', icono: 'cerrar', onClick: quitarFiltros }}>
          No hay productos{enCategoria}{texto && ` que coincidan con “${texto}”`}.
        </Vacio>
      )}
      {!productos.cargando && !productos.error && lista.length === 0 && (
        <Vacio icono="despensa" accion={gestion ? { texto: 'Agregar el primer producto', onClick: nuevo } : undefined}>
          Todavía no cargaste ningún producto. Por ejemplo: arroz, fideos o aceite.
        </Vacio>
      )}

      {seleccionado && (
        <Modal titulo={`Llegó o se usó: ${seleccionado.nombre}`} onCerrar={cerrar}>
          <FormMovimiento producto={seleccionado} productos={lista} onListo={listo} onCancelar={cerrar} />
        </Modal>
      )}
    </div>
  );
}
