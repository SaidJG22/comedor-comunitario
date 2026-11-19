import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api, hoyLocal } from '../../api/client.js';
import { GESTION } from '../../auth/roles.js';
import { useSesion } from '../../store/sesion.js';
import AccionesFila from '../../components/AccionesFila.jsx';
import AyudaPlegable from '../../components/AyudaPlegable.jsx';
import { useAviso } from '../../components/Avisos.jsx';
import { Cargando, Mensajes } from '../../components/Campos.jsx';
import { useConfirmar } from '../../components/Confirmar.jsx';
import EncabezadoPagina from '../../components/EncabezadoPagina.jsx';
import Icono from '../../components/Iconos.jsx';
import SemanaNav from '../../components/SemanaNav.jsx';
import { SERVICIOS } from '../../components/Selector.jsx';
import { useCarga } from '../../hooks/useCarga.js';
import { textoError } from '../../utils/errores.js';
import { fechaLegible, lunesDe, semanaDe } from '../../utils/formato.js';

const TAREAS = [
  { valor: 'cocina', texto: 'Cocina' },
  { valor: 'servicio', texto: 'Servicio' },
];

// Turnos
function TurnosBloque({ fecha, servicio, turnos, gestion, voluntarios, asignando, setAsignando, onQuitar, onAsignar }) {
  const [voluntarioId, setVoluntarioId] = useState('');
  const abierto = (tarea) => asignando?.fecha === fecha && asignando?.servicio === servicio && asignando?.tarea === tarea;

  return (
    <div className="turnos">
      {TAREAS.map((t) => {
        const asignados = turnos.filter((x) => x.tarea === t.valor);
        const ocupados = new Set(asignados.map((x) => x.voluntario));
        return (
          <div key={t.valor} className="turno-linea">
            <span className="turno-tarea">{t.texto}:</span>
            {asignados.length === 0 && <span className="tenue">sin asignar</span>}
            {asignados.map((x) => (
              <span key={x.id} className="chip">
                {x.voluntario}
                {gestion && (
                  <button type="button" aria-label={`Quitar a ${x.voluntario} de ${t.texto.toLowerCase()}`} onClick={() => onQuitar(x, t.texto)}>
                    <Icono nombre="cerrar" tamano={16} />
                  </button>
                )}
              </span>
            ))}
            {gestion && !abierto(t.valor) && (
              <button type="button" className="btn btn-sm btn-outline-secondary mini" onClick={() => { setVoluntarioId(''); setAsignando({ fecha, servicio, tarea: t.valor }); }}>
                <Icono nombre="mas" tamano={16} /> Asignar
              </button>
            )}
            {gestion && abierto(t.valor) && (
              <span className="asignar">
                <select className="form-select" aria-label={`Voluntario para ${t.texto.toLowerCase()}`} value={voluntarioId} onChange={(e) => setVoluntarioId(e.target.value)}>
                  <option value="">Elegir…</option>
                  {voluntarios.filter((v) => !ocupados.has(v.nombre_visible)).map((v) => (
                    <option key={v.id} value={v.id}>{v.nombre_visible}</option>
                  ))}
                </select>
                <button type="button" className="btn btn-sm btn-primary mini" disabled={!voluntarioId}
                        onClick={() => onAsignar({ fecha, servicio, tarea: t.valor, voluntarioId: Number(voluntarioId) })}>
                  Asignar
                </button>
                <button type="button" className="btn-link oscuro" onClick={() => setAsignando(null)}>Cancelar</button>
                {voluntarios.length === 0 && <small className="tenue"> Primero agregá voluntarios en la pestaña Equipo.</small>}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Menús de la semana
export default function SemanaPage() {
  const { usuario } = useSesion();
  const gestion = GESTION.includes(usuario.rol);
  const avisar = useAviso();
  const confirmar = useConfirmar();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const hoy = hoyLocal();
  const fechaPedida = /^\d{4}-\d{2}-\d{2}$/.test(params.get('fecha') ?? '') ? params.get('fecha') : hoy;
  const [lunes, setLunes] = useState(() => lunesDe(fechaPedida));
  const [diaSel, setDiaSel] = useState(fechaPedida);
  const semana = useMemo(() => semanaDe(lunes), [lunes]);
  const rango = `desde=${semana.desde}&hasta=${semana.hasta}`;
  const menus = useCarga(`/menus?${rango}`);
  const turnos = useCarga(`/voluntarios/turnos?${rango}`);
  const productos = useCarga(gestion ? '/stock/productos' : null);
  const voluntarios = useCarga(gestion ? '/voluntarios' : null);
  const [asignando, setAsignando] = useState(null);

  const menuPorClave = useMemo(() => Object.fromEntries((menus.datos ?? []).map((m) => [`${m.fecha}|${m.servicio}`, m])), [menus.datos]);
  const turnosPorClave = useMemo(() => {
    const mapa = {};
    for (const t of turnos.datos ?? []) (mapa[`${t.fecha}|${t.servicio}`] ??= []).push(t);
    return mapa;
  }, [turnos.datos]);

  const falla = (err) => avisar(textoError(err, productos.datos ?? []), 'error');
  const planificar = (fecha, servicio) => navigate(`/semana/menus/nuevo?fecha=${fecha}&servicio=${servicio}`);

  async function confirmarMenu(m) {
    const si = await confirmar({
      titulo: `¿Confirmar "${m.nombre_plato}"?`,
      mensaje: `Se van a descontar de la despensa los ingredientes para ${m.raciones_planificadas} raciones. Un menú confirmado ya no se puede editar ni borrar.`,
      textoSi: 'Sí, confirmar menú',
    });
    if (!si) return;
    try {
      await api(`/menus/${m.id}/confirmar`, { method: 'POST' });
      avisar(`Menú confirmado: "${m.nombre_plato}". Los insumos se descontaron de la despensa.`);
      menus.recargar();
      productos.recargar();
    } catch (err) {
      falla(err);
    }
  }

  async function borrarMenu(m) {
    const si = await confirmar({
      titulo: `¿Borrar el menú "${m.nombre_plato}"?`,
      mensaje: 'No se puede deshacer. La despensa no cambia, porque el menú todavía no estaba confirmado.',
      textoSi: 'Sí, borrar',
      peligro: true,
    });
    if (!si) return;
    try {
      await api(`/menus/${m.id}`, { method: 'DELETE' });
      avisar(`Se borró el menú "${m.nombre_plato}".`);
      menus.recargar();
    } catch (err) {
      falla(err);
    }
  }

  async function asignar(datos) {
    try {
      await api('/voluntarios/turnos', { method: 'POST', body: datos });
      setAsignando(null);
      avisar('Turno asignado.');
      turnos.recargar();
    } catch (err) {
      if (err.status === 409) avisar('Esa persona ya está asignada a ese turno.', 'error');
      else falla(err);
    }
  }

  async function quitar(t, tarea) {
    const si = await confirmar({
      titulo: `¿Quitar a ${t.voluntario} del turno?`,
      mensaje: `Deja de figurar en ${tarea.toLowerCase()} de ese día. Lo podés volver a asignar cuando quieras.`,
      textoSi: 'Sí, quitar',
      peligro: true,
    });
    if (!si) return;
    try {
      await api(`/voluntarios/turnos/${t.id}`, { method: 'DELETE' });
      avisar(`Se quitó a ${t.voluntario} del turno.`);
      turnos.recargar();
    } catch (err) {
      falla(err);
    }
  }

  return (
    <div>
      <EncabezadoPagina
        nivel={2}
        titulo="Menús de la semana"
        descripcion={gestion ? 'Qué se cocina y quién ayuda, día por día.' : undefined}
        accion={gestion ? { texto: 'Planificar menú', onClick: () => planificar(diaSel, 'almuerzo') } : undefined}
      />
      <AyudaPlegable>
        {gestion ? (
          <ol>
            <li>Tocá <strong>Planificar menú</strong> (o <strong>Planificar</strong> en un día vacío) y completá qué se cocina y para cuántas raciones.</li>
            <li>Cuando se cocina, tocá <strong>Confirmar</strong>: los ingredientes se descuentan de la despensa.</li>
            <li>Con <strong>Asignar</strong> elegís quién cocina y quién sirve. La × quita a alguien del turno.</li>
            <li>Si te equivocaste en un menú que todavía no confirmaste, podés <strong>Editar</strong> o <strong>Borrar</strong>.</li>
          </ol>
        ) : (
          <ol>
            <li>Acá ves el menú de cada día y quiénes cocinan y sirven.</li>
            <li>Usá las flechas para ver otras semanas, y <strong>Ver detalle</strong> para los ingredientes.</li>
            <li>Para anotar cuántas raciones se sirvieron, andá a <strong>Raciones</strong>.</li>
          </ol>
        )}
      </AyudaPlegable>

      <SemanaNav
        lunes={lunes}
        onChange={(l) => {
          setLunes(l);
          // Mismo día
          const nueva = semanaDe(l);
          setDiaSel(nueva.dias.includes(hoy) ? hoy : nueva.dias[Math.max(0, semana.dias.indexOf(diaSel))]);
          setAsignando(null);
        }}
      />
      <div className="dias-selector" role="group" aria-label="Día de la semana">
        {semana.dias.map((d) => {
          const fecha = new Date(`${d}T12:00:00`);
          const conMenu = SERVICIOS.some((s) => menuPorClave[`${d}|${s.valor}`]);
          return (
            <button
              key={d}
              type="button"
              aria-pressed={d === diaSel}
              aria-label={`${fechaLegible(d)}${d === hoy ? ' (hoy)' : ''}${conMenu ? ', con menú' : ''}`}
              className={`${d === diaSel ? 'activo' : ''}${d === hoy ? ' hoy' : ''}`}
              onClick={() => { setDiaSel(d); setAsignando(null); }}
            >
              <span>{fecha.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '')}</span>
              <strong>{fecha.getDate()}</strong>
              <i className={conMenu ? 'punto' : 'punto apagado'} aria-hidden="true" />
            </button>
          );
        })}
      </div>
      <Mensajes error={menus.error || turnos.error || productos.error || voluntarios.error} />

      {(menus.cargando || turnos.cargando) && !menus.datos && <Cargando />}
      {semana.dias.filter((d) => d === diaSel).map((dia) => (
        <div className="dia" key={dia}>
          <h2>{fechaLegible(dia)}{dia === hoy && <span className="badge rounded-pill insignia hoy">Hoy</span>}</h2>
          <div className="row g-3">
            {SERVICIOS.map((s) => {
              const m = menuPorClave[`${dia}|${s.valor}`];
              return (
                <div className="col-12 col-lg-6" key={s.valor}>
                  <div className="bloque h-100">
                    <h3>{s.texto}</h3>
                    {m ? (
                      <>
                        <p className="plato">
                          {m.nombre_plato}
                          <span className={`badge rounded-pill insignia ${m.estado}`}>{m.estado === 'confirmado' ? 'Confirmado' : 'Planificado'}</span>
                        </p>
                        <p className="tenue sin-margen">{m.raciones_planificadas} raciones planificadas</p>
                        {gestion && m.estado === 'planificado' && (
                          <AccionesFila
                            acciones={[
                              { texto: 'Confirmar', icono: 'tilde', primario: true, etiqueta: `Confirmar el menú ${m.nombre_plato}`, onClick: () => confirmarMenu(m) },
                              { texto: 'Editar', icono: 'editar', etiqueta: `Editar el menú ${m.nombre_plato}`, onClick: () => navigate(`/semana/menus/${m.id}/editar`) },
                              { texto: 'Borrar', icono: 'borrar', peligro: true, etiqueta: `Borrar el menú ${m.nombre_plato}`, onClick: () => borrarMenu(m) },
                            ]}
                          />
                        )}
                        <div className="acciones-menu">
                          <Link to={`/semana/menus/${m.id}`} className="btn-link oscuro">Ver detalle e ingredientes</Link>
                        </div>
                      </>
                    ) : (
                      <div className="sin-menu">
                        <p className="tenue">Sin menú planificado.</p>
                        {gestion && (
                          <button type="button" className="btn btn-sm btn-primary mini" onClick={() => planificar(dia, s.valor)}>
                            <Icono nombre="mas" tamano={16} /> Planificar
                          </button>
                        )}
                      </div>
                    )}
                    <TurnosBloque
                      fecha={dia} servicio={s.valor} turnos={turnosPorClave[`${dia}|${s.valor}`] ?? []} gestion={gestion}
                      voluntarios={voluntarios.datos ?? []} asignando={asignando} setAsignando={setAsignando}
                      onQuitar={quitar} onAsignar={asignar}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
