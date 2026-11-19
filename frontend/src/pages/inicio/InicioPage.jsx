import { Link } from 'react-router-dom';
import { hoyLocal } from '../../api/client.js';
import { GESTION } from '../../auth/roles.js';
import { useSesion } from '../../store/sesion.js';
import { Mensajes } from '../../components/Campos.jsx';
import { GraficoRaciones } from '../../components/graficos/index.jsx';
import Icono from '../../components/Iconos.jsx';
import Kpis from '../../components/Kpis.jsx';
import Portada from '../../components/Portada.jsx';
import { SERVICIOS } from '../../components/Selector.jsx';
import { useCarga } from '../../hooks/useCarga.js';
import { fechaLegible, mesDe, num, semanaDe } from '../../utils/formato.js';

/** Primeros pasos */
function PrimerosPasos({ pasos }) {
  const hechos = pasos.filter((p) => p.hecho).length;
  return (
    <div className="primeros-pasos" role="region" aria-label="Primeros pasos">
      <h2>Para empezar</h2>
      <p className="tenue">{hechos} de {pasos.length} pasos listos</p>
      <ol>
        {pasos.map((p) => (
          <li key={p.texto} className={p.hecho ? 'hecho' : ''}>
            <span className="tilde" aria-hidden="true">{p.hecho ? <Icono nombre="tilde" tamano={18} /> : null}</span>
            <Link to={p.to}>{p.texto}</Link>
            <span className="sr-only">{p.hecho ? ' (listo)' : ' (pendiente)'}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const ACCESOS = [
  { to: '/despensa/donaciones', texto: 'Registrar una donación', icono: 'donacion' },
  { to: '/semana', texto: 'Planificar la semana', icono: 'semana' },
  { to: '/informes', texto: 'Ver informes y gráficos', icono: 'informes' },
];

export default function InicioPage() {
  const { usuario } = useSesion();
  const gestion = GESTION.includes(usuario.rol);
  const hoy = hoyLocal();
  const semana = semanaDe(hoy);
  const inicioMes = mesDe(hoy).desde;

  const raciones = useCarga(`/raciones?desde=${hoy}&hasta=${hoy}`);
  const menusSemana = useCarga(`/menus?desde=${semana.desde}&hasta=${semana.hasta}`);
  const turnosHoy = useCarga(`/voluntarios/turnos?desde=${hoy}&hasta=${hoy}`);
  const tablero = useCarga(gestion ? `/reportes/tablero?desde=${inicioMes}&hasta=${hoy}` : null);
  const productos = useCarga(gestion ? '/stock/productos' : null);
  const voluntarios = useCarga(gestion ? '/voluntarios' : null);
  const donaciones = useCarga(gestion ? '/donaciones' : null);

  const cargandoPasos = [productos, voluntarios, donaciones, menusSemana].some((c) => c.cargando);
  const pasos = gestion && !cargandoPasos && productos.datos && voluntarios.datos && donaciones.datos && menusSemana.datos
    ? [
        { texto: 'Cargá los productos de tu despensa', to: '/despensa/existencias', hecho: productos.datos.length > 0 },
        { texto: 'Registrá lo que ya tenés o lo que llegó', to: '/despensa/donaciones', hecho: donaciones.datos.length > 0 || productos.datos.some((p) => Number(p.stock_actual) > 0) },
        { texto: 'Sumá a tu equipo de voluntarios', to: '/semana/equipo', hecho: voluntarios.datos.length > 0 },
        { texto: 'Planificá el menú de la semana', to: '/semana', hecho: menusSemana.datos.length > 0 },
      ]
    : [];

  const racionesDe = (s) => (raciones.datos ?? []).find((r) => r.servicio === s)?.cantidad;
  const menuDe = (s) => (menusSemana.datos ?? []).find((m) => m.fecha === hoy && m.servicio === s);
  const turnosDe = (s, tarea) =>
    (turnosHoy.datos ?? []).filter((t) => t.servicio === s && t.tarea === tarea).map((t) => t.voluntario).join(', ');

  return (
    <section>
      {/* Foto */}
      <Portada src="/imagenes/inicio.jpg" className="banner">
        <h1>Hola, {usuario.nombre}</h1>
        <p>{fechaLegible(hoy)}</p>
      </Portada>

      {pasos.length > 0 && pasos.some((p) => !p.hecho) && <PrimerosPasos pasos={pasos} />}

      {gestion && (
        <>
          <h2 className="seccion">Este mes</h2>
          <Mensajes error={tablero.error} />
          {tablero.datos && <Kpis kpis={tablero.datos.kpis} periodo="este mes" />}
        </>
      )}

      <h2 className="seccion">Hoy</h2>
      <div className="row g-3 mb-3">
        {SERVICIOS.map((s) => {
          const menu = menuDe(s.valor);
          const cantidad = racionesDe(s.valor);
          const cocina = turnosDe(s.valor, 'cocina');
          const servicio = turnosDe(s.valor, 'servicio');
          return (
            <div className="col-12 col-lg-6" key={s.valor}>
              <div className="tarjeta-hoy h-100">
                <h3>{s.texto}</h3>
                <p>
                  <span className="etiqueta">Menú:</span>{' '}
                  {menu ? <>{menu.nombre_plato} ({menu.raciones_planificadas} raciones)</> : <span className="tenue">sin planificar</span>}
                </p>
                <p>
                  <span className="etiqueta">Cocina:</span> {cocina || <span className="tenue">sin asignar</span>}
                  {' · '}
                  <span className="etiqueta">Servicio:</span> {servicio || <span className="tenue">sin asignar</span>}
                </p>
                <p>
                  <span className="etiqueta">Raciones servidas:</span>{' '}
                  {cantidad === undefined ? <span className="tenue">todavía sin cargar</span> : <strong>{num(cantidad)}</strong>}
                </p>
                <Link to={`/raciones?servicio=${s.valor}`} className={cantidad === undefined ? 'btn btn-primary' : 'btn btn-outline-secondary'}>
                  {cantidad === undefined ? 'Cargar' : 'Corregir'} raciones {s.valor === 'almuerzo' ? 'del almuerzo' : 'de la merienda'}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {gestion && tablero.datos && (
        <div className="mb-3">
          <GraficoRaciones datos={tablero.datos.racionesPorDia} titulo="Raciones de este mes" />
        </div>
      )}

      {gestion && (
        <div className="row g-3">
          {ACCESOS.map((a) => (
            <div key={a.to} className="col-12 col-md-4">
              <Link to={a.to} className="tarjeta h-100">
                <span className="tarjeta-texto">
                  <Icono nombre={a.icono} /> {a.texto}
                </span>
                <Icono nombre="flecha" tamano={20} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
