import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, hoyLocal } from '../api/client.js';
import AyudaPlegable from '../components/AyudaPlegable.jsx';
import { Entrada, Mensajes } from '../components/Campos.jsx';
import Selector, { SERVICIOS } from '../components/Selector.jsx';
import { useCarga } from '../hooks/useCarga.js';
import { textoError } from '../utils/errores.js';
import { fechaLegible, num, sumarDias } from '../utils/formato.js';

const DIAS = [
  { valor: 'hoy', texto: 'Hoy' },
  { valor: 'otro', texto: 'Otro día' },
];

/**
 * Registro diario de raciones servidas. Solo se carga una CANTIDAD por servicio:
 * no hay campos de personas (el sistema no es un CRM). Se puede cargar un día anterior.
 */
export default function RacionesPage() {
  const hoy = hoyLocal();
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

  return (
    <section>
      <h1>Raciones servidas</h1>
      <p className="sub">{fechaLegible(fecha)}</p>
      <AyudaPlegable>
        <ol>
          <li>Elegí el día (por defecto es hoy) y el servicio: almuerzo o merienda.</li>
          <li>Escribí cuántas raciones se sirvieron en total, o usá los botones + y −.</li>
          <li>Tocá <strong>Guardar</strong>. Si te equivocás, volvé a cargar el número correcto: reemplaza al anterior.</li>
          <li>Solo se anota la cantidad; no hace falta cargar nombres ni datos de las personas.</li>
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
          <button type="button" className="mini" onClick={() => setCantidad(menuPlanificado.raciones_planificadas)}>
            Usar {menuPlanificado.raciones_planificadas}
          </button>
        </div>
      )}

      <form onSubmit={guardar}>
        <label htmlFor="cantidad">Cantidad de raciones servidas</label>
        <div className="stepper">
          <button type="button" aria-label="Restar 1" onClick={() => ajustar(-1)}>−</button>
          <input id="cantidad" type="number" inputMode="numeric" min="0" max="5000" value={cantidad}
                 onChange={(e) => setCantidad(Math.max(0, Number(e.target.value) || 0))} />
          <button type="button" aria-label="Sumar 1" onClick={() => ajustar(1)}>+</button>
        </div>
        <div className="atajos">
          {[5, 10].map((n) => (
            <button key={n} type="button" className="btn-sec" onClick={() => ajustar(n)}>+{n}</button>
          ))}
        </div>

        <Mensajes error={error || registradas.error} ok={mensaje} />
        <button type="submit" className="btn" disabled={guardando || !fechaValida}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </form>

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
