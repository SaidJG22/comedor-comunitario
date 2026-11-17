import { useState } from 'react';
import { api, hoyLocal } from '../api/client.js';
import { GESTION, useAuth } from '../auth/AuthContext.jsx';
import AyudaPlegable from '../components/AyudaPlegable.jsx';
import { Cargando, Entrada, Lista, Mensajes, Vacio } from '../components/Campos.jsx';
import NuevoProducto from '../components/NuevoProducto.jsx';
import Selector from '../components/Selector.jsx';
import { useCarga } from '../hooks/useCarga.js';
import { textoError } from '../utils/errores.js';
import { fechaCorta, num } from '../utils/formato.js';

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
      onListo(`${f.tipo === 'ingreso' ? 'Se sumaron' : 'Se restaron'} ${num(f.cantidad)} ${producto.unidad} de ${producto.nombre}.`);
    } catch (err) {
      setError(textoError(err, productos));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="panel" onSubmit={enviar} aria-label={`Movimiento de ${producto.nombre}`}>
      <h2>{producto.nombre}</h2>
      <p className="tenue">Ahora hay {num(producto.stock_actual)} {producto.unidad}.</p>
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
      <button type="submit" className="btn" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar'}</button>
      <button type="button" className="btn-link oscuro" onClick={onCancelar}>Cancelar</button>
    </form>
  );
}

export default function StockPage() {
  const { usuario } = useAuth();
  const gestion = GESTION.includes(usuario.rol);
  const productos = useCarga('/stock/productos');
  const alertas = useCarga('/stock/alertas?dias=7');
  const [panel, setPanel] = useState(null); // 'nuevo' | id de producto | null
  const [ok, setOk] = useState('');

  const lista = productos.datos ?? [];
  const { stockBajo = [], porVencer = [] } = alertas.datos ?? {};
  const bajo = new Set(stockBajo.map((p) => p.id));

  function listo(mensaje) {
    setPanel(null);
    setOk(mensaje);
    productos.recargar();
    alertas.recargar();
  }

  const seleccionado = typeof panel === 'number' ? lista.find((p) => p.id === panel) : null;

  return (
    <div>
      <h2>Lo que hay en la despensa</h2>
      <AyudaPlegable>
        <ol>
          <li>Agregá cada producto una sola vez con <strong>Nuevo producto</strong>.</li>
          <li>Cuando llega o se usa mercadería, tocá <strong>Llegó / se usó</strong> en ese producto.</li>
          <li>Lo que llega por donación se suma solo desde la pestaña <strong>Donaciones</strong>.</li>
          <li>Si te equivocaste, corregilo con la opción <strong>Corrección</strong>: así queda registrado.</li>
        </ol>
      </AyudaPlegable>
      <Mensajes error={productos.error || alertas.error} ok={ok} />

      {(stockBajo.length > 0 || porVencer.length > 0) && (
        <div className="alertas" role="region" aria-label="Alertas de stock">
          <h3>Atención</h3>
          <ul>
            {stockBajo.map((p) => (
              <li key={`b${p.id}`}>
                Queda poco <strong>{p.nombre}</strong>: {num(p.stock_actual)} {p.unidad}
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
                ({num(l.cantidad_actual)} {l.unidad})
              </li>
            ))}
          </ul>
        </div>
      )}

      {gestion && panel !== 'nuevo' && (
        <button type="button" className="btn ancho" onClick={() => { setOk(''); setPanel('nuevo'); }}>
          + Nuevo producto
        </button>
      )}
      {panel === 'nuevo' && <NuevoProducto onListo={listo} onCancelar={() => setPanel(null)} />}
      {seleccionado && (
        <FormMovimiento producto={seleccionado} productos={lista} onListo={listo} onCancelar={() => setPanel(null)} />
      )}

      {productos.cargando && <Cargando />}
      <ul className="lista">
        {lista.map((p) => (
          <li key={p.id} className={bajo.has(p.id) ? 'bajo' : ''}>
            <span>{p.nombre}</span>
            <span className="derecha">
              {num(p.stock_actual)} {p.unidad}
              {gestion && (
                <button type="button" className="mini" aria-label={`Registrar llegada o uso de ${p.nombre}`}
                        onClick={() => { setOk(''); setPanel(p.id); }}>
                  Llegó / se usó
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>
      {!productos.cargando && !productos.error && lista.length === 0 && (
        <Vacio>
          Todavía no cargaste ningún producto.{gestion && ' Tocá "Nuevo producto" para empezar: por ejemplo arroz, fideos o aceite.'}
        </Vacio>
      )}
    </div>
  );
}
