import { Link } from 'react-router-dom';
import { hoyLocal } from '../api/client.js';
import { GESTION, useAuth } from '../auth/AuthContext.jsx';
import Icono from '../components/Iconos.jsx';
import { SERVICIOS } from '../components/Selector.jsx';
import { useCarga } from '../hooks/useCarga.js';
import { fechaLegible, num, semanaDe } from '../utils/formato.js';

/** Lista de primeros pasos: se muestra mientras falte alguno y desaparece al completarse. */
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

export default function InicioPage() {
  const { usuario } = useAuth();
  const gestion = GESTION.includes(usuario.rol);
  const hoy = hoyLocal();
  const semana = semanaDe(hoy);

  const raciones = useCarga(`/raciones?desde=${hoy}&hasta=${hoy}`);
  const menusSemana = useCarga(`/menus?desde=${semana.desde}&hasta=${semana.hasta}`);
  const turnosHoy = useCarga(`/voluntarios/turnos?desde=${hoy}&hasta=${hoy}`);
  const alertas = useCarga(gestion ? '/stock/alertas?dias=7' : null);
  const productos = useCarga(gestion ? '/stock/productos' : null);
  const voluntarios = useCarga(gestion ? '/voluntarios' : null);
  const donaciones = useCarga(gestion ? '/donaciones' : null);

  const cargandoPasos = [productos, voluntarios, donaciones, menusSemana].some((c) => c.cargando);
  const pasos = gestion && !cargandoPasos && productos.datos && voluntarios.datos && donaciones.datos && menusSemana.datos
    ? [
        { texto: 'Cargá los productos de tu despensa', to: '/despensa/existencias', hecho: productos.datos.length > 0 },
        { texto: 'Registrá lo que ya tenés o lo que llegó', to: '/despensa/donaciones', hecho: donaciones.datos.length > 0 || productos.datos.some((p) => Number(p.stock_actual) > 0) },
        { texto: 'Sumá a tu equipo de voluntarios', to: '/semana#equipo', hecho: voluntarios.datos.length > 0 },
        { texto: 'Planificá el menú de la semana', to: '/semana', hecho: menusSemana.datos.length > 0 },
      ]
    : [];

  const cantidadAlertas = (alertas.datos?.stockBajo?.length ?? 0) + (alertas.datos?.porVencer?.length ?? 0);
  const racionesDe = (s) => (raciones.datos ?? []).find((r) => r.servicio === s)?.cantidad;
  const menuDe = (s) => (menusSemana.datos ?? []).find((m) => m.fecha === hoy && m.servicio === s);
  const turnosDe = (s, tarea) =>
    (turnosHoy.datos ?? []).filter((t) => t.servicio === s && t.tarea === tarea).map((t) => t.voluntario).join(', ');

  return (
    <section>
      <h1>Hola, {usuario.nombre}</h1>
      <p className="sub">{fechaLegible(hoy)}</p>

      {pasos.length > 0 && pasos.some((p) => !p.hecho) && <PrimerosPasos pasos={pasos} />}

      {gestion && cantidadAlertas > 0 && (
        <Link to="/despensa/existencias" className="alerta-enlace">
          <strong>{cantidadAlertas} {cantidadAlertas === 1 ? 'aviso' : 'avisos'} en la despensa</strong>
          <span>Poco stock o productos por vencer. Tocá para verlos →</span>
        </Link>
      )}

      <h2 className="seccion">Hoy</h2>
      {SERVICIOS.map((s) => {
        const menu = menuDe(s.valor);
        const cantidad = racionesDe(s.valor);
        const cocina = turnosDe(s.valor, 'cocina');
        const servicio = turnosDe(s.valor, 'servicio');
        return (
          <div className="tarjeta-hoy" key={s.valor}>
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
            <Link to={`/raciones?servicio=${s.valor}`} className="btn ancho">
              {cantidad === undefined ? 'Cargar' : 'Corregir'} raciones {s.valor === 'almuerzo' ? 'del almuerzo' : 'de la merienda'}
            </Link>
          </div>
        );
      })}

      {gestion && (
        <div className="tarjetas">
          <Link to="/despensa/donaciones" className="tarjeta">Registrar una donación</Link>
          <Link to="/semana" className="tarjeta">Planificar la semana</Link>
          <Link to="/informes" className="tarjeta">Ver informes</Link>
        </div>
      )}
    </section>
  );
}
