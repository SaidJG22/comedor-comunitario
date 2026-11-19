import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, hoyLocal } from '../../api/client.js';
import { GESTION } from '../../auth/roles.js';
import { useSesion } from '../../store/sesion.js';
import AyudaPlegable from '../../components/AyudaPlegable.jsx';
import { Entrada, Mensajes } from '../../components/Campos.jsx';
import { useConfirmar } from '../../components/Confirmar.jsx';
import Icono from '../../components/Iconos.jsx';
import Selector, { SERVICIOS } from '../../components/Selector.jsx';
import { useCarga } from '../../hooks/useCarga.js';
import { textoError } from '../../utils/errores.js';
import { fechaLegible, num, sumarDias } from '../../utils/formato.js';

const DIAS = [
  { valor: 'hoy', texto: 'Hoy' },
  { valor: 'otro', texto: 'Otro día' },
];

/** Raciones */
export default function RacionesPage() {
  const hoy = hoyLocal();
  const { usuario } = useSesion();
  const gestion = GESTION.includes(usuario.rol);
  const confirmar = useConfirmar();
  const [params] = useSearchParams();
  const [dia, setDia] = useState('hoy');
  const [otraFecha, setOtraFecha] = useState(() => sumarDias(hoy, -1));
  const [servicio, setServicio] = useState(params.get('servicio') === 'merienda' ? 'merienda' : 'almuerzo');
  const [cantidad, setCantidad] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const fecha = dia === 'hoy' ? hoy : otraFecha;
  const fechaValida = fecha && fecha <= hoy;
  const registradas = useCarga(fechaValida ? `/raciones?desde=${fecha}&hasta=${fecha}` : null);
  const menus = useCarga(fechaValida ? `/menus?desde=${fecha}&hasta=${fecha}` : null);

  const porServicio = useMemo(
    () => Object.fromEntries((registradas.datos ?? []).map((f) => [f.servicio, f.cantidad])),
    [registradas.datos],
  );
  const registro = (registradas.datos ?? []).find((f) => f.servicio === servicio);
  const menuPlanificado = (menus.datos ?? []).find((m) => m.servicio === servicio);
  const totalDelDia = Object.values(porServicio).reduce((a, b) => a + Number(b), 0);
  const nombreServicio = SERVICIOS.find((s) => s.valor === servicio).texto.toLowerCase();

  useEffect(() => {
    setCantidad(porServicio[servicio] ?? 0);
  }, [porServicio, servicio, fecha]);

  const limpiar = () => {
    setMensaje('');
    setError('');
  };
  const ajustar = (delta) => setCantidad((c) => Math.max(0, c + delta));

  async function guardar(e) {
    e.preventDefault();
    limpiar();
    setGuardando(true);
    try {
      await api('/raciones', { method: 'PUT', body: { fecha, servicio, cantidad } });
      setMensaje(`Listo: se guardaron ${num(cantidad)} raciones de ${nombreServicio} del ${fechaLegible(fecha).toLowerCase()}.`);
      registradas.recargar();
    } catch (err) {
      setError(textoError(err));
    } finally {
      setGuardando(false);
    }
  }

  // Borrar registro
  async function borrarRegistro() {
    const si = await confirmar({
      titulo: `¿Borrar las raciones de ${nombreServicio}?`,
      mensaje: `Se borra el registro de ${num(registro.cantidad)} raciones del ${fechaLegible(fecha).toLowerCase()}. Si solo te equivocaste en el número, corregilo y tocá Guardar.`,
      textoSi: 'Sí, borrar',
      peligro: true,
    });
    if (!si) return;
    limpiar();
    try {
      await api(`/raciones/${registro.id}`, { method: 'DELETE' });
      setMensaje(`Se borró el registro de ${nombreServicio} del ${fechaLegible(fecha).toLowerCase()}.`);
      registradas.recargar();
    } catch (err) {
      setError(textoError(err));
    }
  }

  return (
    <section className="raciones-caja">
      <h1>Raciones servidas</h1>
      <p className="sub">{fechaLegible(fecha)}</p>
      <AyudaPlegable>
        <ol>
          <li>Elegí el día (por defecto es hoy) y el servicio: almuerzo o merienda.</li>
          <li>Escribí cuántas raciones se sirvieron en total, o usá los botones + y −.</li>
          <li>Tocá <strong>Guardar</strong>. Si te equivocás, volvé a cargar el número correcto: reemplaza al anterior.</li>
          <li>Solo se anota la cantidad; no hace falta cargar nombres ni datos de las personas.</li>
          {gestion && <li>Si se cargó un día o un servicio por error, abrilo y tocá <strong>Borrar este registro</strong>.</li>}
        </ol>
      </AyudaPlegable>

      <Selector etiqueta="Día" opciones={DIAS} valor={dia} onChange={(d) => { setDia(d); limpiar(); }} />
      {dia === 'otro' && (
        <Entrada label="¿Qué día fue?" type="date" max={hoy} value={otraFecha}
                 onChange={(e) => { setOtraFecha(e.target.value); limpiar(); }} />
      )}
      {!fechaValida && <Mensajes error="Elegí un día que no sea posterior a hoy." />}

      <Selector valor={servicio} onChange={(s) => { setServicio(s); limpiar(); }} />

      {menuPlanificado && (
        <div className="sugerencia">
          Menú planificado: <strong>{menuPlanificado.nombre_plato}</strong> · {menuPlanificado.raciones_planificadas} raciones
          <button type="button" className="btn btn-sm btn-outline-secondary mini" onClick={() => setCantidad(menuPlanificado.raciones_planificadas)}>
            Usar {menuPlanificado.raciones_planificadas}
          </button>
        </div>
      )}

      <form onSubmit={guardar}>
        <label htmlFor="cantidad" className="form-label">Cantidad de raciones servidas</label>
        <div className="stepper">
          <button type="button" aria-label="Restar 1" onClick={() => ajustar(-1)}>−</button>
          <input id="cantidad" className="form-control" type="number" inputMode="numeric" min="0" max="5000" value={cantidad}
                 onChange={(e) => setCantidad(Math.max(0, Number(e.target.value) || 0))} />
          <button type="button" aria-label="Sumar 1" onClick={() => ajustar(1)}>+</button>
        </div>
        <div className="atajos">
          {[5, 10].map((n) => (
            <button key={n} type="button" className="btn btn-outline-secondary" onClick={() => ajustar(n)}>+{n}</button>
          ))}
        </div>

        <Mensajes error={error || registradas.error} ok={mensaje} />
        <button type="submit" className="btn btn-primary" disabled={guardando || !fechaValida}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </form>

      {gestion && registro && (
        <button type="button" className="btn btn-outline-danger ancho separado" onClick={borrarRegistro}>
          <Icono nombre="borrar" tamano={18} /> Borrar este registro
        </button>
      )}

      {totalDelDia > 0 && (
        <p className="tenue">
          Total cargado ese día: <strong>{num(totalDelDia)}</strong> raciones
          {SERVICIOS.filter((s) => porServicio[s.valor] !== undefined)
            .map((s) => ` (${s.texto.toLowerCase()}: ${num(porServicio[s.valor])})`)
            .join('')}.
        </p>
      )}
    </section>
  );
}
