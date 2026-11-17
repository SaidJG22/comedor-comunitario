import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api, hoyLocal } from '../api/client.js';
import { GESTION, useAuth } from '../auth/AuthContext.jsx';
import AyudaPlegable from '../components/AyudaPlegable.jsx';
import { Cargando, Entrada, Lista, Mensajes } from '../components/Campos.jsx';
import NuevoProducto from '../components/NuevoProducto.jsx';
import SemanaNav from '../components/SemanaNav.jsx';
import Selector, { SERVICIOS } from '../components/Selector.jsx';
import { useCarga } from '../hooks/useCarga.js';
import { textoError } from '../utils/errores.js';
import { fechaLegible, lunesDe, num, semanaDe } from '../utils/formato.js';

const TAREAS = [
  { valor: 'cocina', texto: 'Cocina' },
  { valor: 'servicio', texto: 'Servicio' },
];
const insumoVacio = { productoId: '', total: '' };

// ---------------------------------------------------------------- formulario de menú
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
      onListo(editando ? 'Menú actualizado.' : 'Menú planificado. Cuando lo confirmes, se descuentan los insumos de la despensa.');
    } catch (err) {
      setError(err.status === 409 && !editando ? 'Ya hay un menú para ese día y ese servicio. Editá el que ya existe.' : textoError(err));
    } finally {
      setEnviando(false);
    }
  }

  const opciones = productos.map((p) => ({ valor: String(p.id), texto: `${p.nombre} (${p.unidad})` }));

  return (
    <div className="panel">
      <form onSubmit={enviar} aria-label={editando ? 'Editar menú' : 'Planificar menú'}>
        <h2>{editando ? 'Editar menú' : 'Planificar menú'}</h2>
        <Entrada label="Día" type="date" required value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} />
        <Selector valor={f.servicio} onChange={(servicio) => setF({ ...f, servicio })} />
        <Entrada label="¿Qué se cocina?" required maxLength={100} placeholder="Ej.: Guiso de lentejas" value={f.nombrePlato}
                 onChange={(e) => setF({ ...f, nombrePlato: e.target.value })} />
        <Entrada label="¿Para cuántas raciones?" type="number" inputMode="numeric" min="1" max="5000" required
                 value={f.raciones} onChange={(e) => setF({ ...f, raciones: e.target.value })} />

        <h3>¿Qué ingredientes se usan?</h3>
        <p className="tenue">Escribí cuánto se usa <strong>en total</strong> para todas las raciones. Estos ingredientes se descuentan de la despensa al confirmar el menú.</p>
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
        <button type="button" className="btn-sec" onClick={() => setInsumos((p) => [...p, { ...insumoVacio }])}>
          + Agregar otro ingrediente
        </button>

        <Mensajes error={error} />
        <button type="submit" className="btn" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar menú'}</button>
        <button type="button" className="btn-link oscuro" onClick={onCancelar}>Cancelar</button>
      </form>

      {agregando ? (
        <NuevoProducto onCancelar={() => setAgregando(false)}
                       onListo={(m, creado) => { setAgregando(false); onProductoCreado(m, creado); }} />
      ) : (
        <button type="button" className="btn-link oscuro" onClick={() => setAgregando(true)}>
          ¿Falta un producto en la lista? Agregalo acá
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- turnos de un servicio
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
                  <button type="button" aria-label={`Quitar a ${x.voluntario} de ${t.texto.toLowerCase()}`} onClick={() => onQuitar(x)}>×</button>
                )}
              </span>
            ))}
            {gestion && !abierto(t.valor) && (
              <button type="button" className="mini" onClick={() => { setVoluntarioId(''); setAsignando({ fecha, servicio, tarea: t.valor }); }}>
                + Asignar
              </button>
            )}
            {gestion && abierto(t.valor) && (
              <span className="asignar">
                <select aria-label={`Voluntario para ${t.texto.toLowerCase()}`} value={voluntarioId} onChange={(e) => setVoluntarioId(e.target.value)}>
                  <option value="">Elegir…</option>
                  {voluntarios.filter((v) => !ocupados.has(v.nombre_visible)).map((v) => (
                    <option key={v.id} value={v.id}>{v.nombre_visible}</option>
                  ))}
                </select>
                <button type="button" className="mini" disabled={!voluntarioId}
                        onClick={() => onAsignar({ fecha, servicio, tarea: t.valor, voluntarioId: Number(voluntarioId) })}>
                  Asignar
                </button>
                <button type="button" className="btn-link oscuro" onClick={() => setAsignando(null)}>Cancelar</button>
                {voluntarios.length === 0 && <small className="tenue"> Primero agregá voluntarios al final de esta pantalla.</small>}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- equipo de voluntarios
function EquipoVoluntarios({ voluntarios, onCambio }) {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');

  async function agregar(e) {
    e.preventDefault();
    setError('');
    try {
      await api('/voluntarios', { method: 'POST', body: { nombreVisible: nombre.trim() } });
      onCambio(`Se agregó a ${nombre.trim()} al equipo.`);
      setNombre('');
    } catch (err) {
      setError(textoError(err));
    }
  }

  async function darDeBaja(v) {
    setError('');
    try {
      await api(`/voluntarios/${v.id}`, { method: 'PATCH', body: { activo: false } });
      onCambio(`${v.nombre_visible} ya no figura en el equipo.`);
    } catch (err) {
      setError(textoError(err));
    }
  }

  return (
    <div className="panel" id="equipo">
      <h2>Equipo de voluntarios</h2>
      <form onSubmit={agregar} aria-label="Nuevo voluntario">
        <Entrada label="Nombre o apodo" required maxLength={80} value={nombre} placeholder="Ej.: Luis"
                 ayuda="Alcanza con un nombre para reconocerlo/a. No cargues documento ni otros datos personales."
                 onChange={(e) => setNombre(e.target.value)} />
        <button type="submit" className="btn-sec">Agregar al equipo</button>
      </form>
      <Mensajes error={error} />
      {voluntarios.length > 0 && (
        <ul className="lista" aria-label="Voluntarios">
          {voluntarios.map((v) => (
            <li key={v.id}>
              <span>{v.nombre_visible}</span>
              <button type="button" className="mini" aria-label={`Dar de baja a ${v.nombre_visible}`} onClick={() => darDeBaja(v)}>
                Dar de baja
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- pantalla
export default function SemanaPage() {
  const { usuario } = useAuth();
  const gestion = GESTION.includes(usuario.rol);
  const hoy = hoyLocal();
  const { hash } = useLocation();
  const [lunes, setLunes] = useState(() => lunesDe(hoy));
  const [diaSel, setDiaSel] = useState(hoy); // se muestra de a un día: empieza por hoy
  const semana = useMemo(() => semanaDe(lunes), [lunes]);
  const rango = `desde=${semana.desde}&hasta=${semana.hasta}`;
  const menus = useCarga(`/menus?${rango}`);
  const turnos = useCarga(`/voluntarios/turnos?${rango}`);
  const productos = useCarga(gestion ? '/stock/productos' : null);
  const voluntarios = useCarga(gestion ? '/voluntarios' : null);

  const [form, setForm] = useState(null);
  const [asignando, setAsignando] = useState(null);
  const [pendiente, setPendiente] = useState(null); // { tipo: 'confirmar' | 'borrar', id }
  const [detalle, setDetalle] = useState(null);
  const [ok, setOk] = useState('');
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);
  const refForm = useRef(null);

  const menuPorClave = useMemo(() => Object.fromEntries((menus.datos ?? []).map((m) => [`${m.fecha}|${m.servicio}`, m])), [menus.datos]);
  const turnosPorClave = useMemo(() => {
    const mapa = {};
    for (const t of turnos.datos ?? []) (mapa[`${t.fecha}|${t.servicio}`] ??= []).push(t);
    return mapa;
  }, [turnos.datos]);

  useEffect(() => {
    if (form) refForm.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }, [form]);
  useEffect(() => {
    if (hash === '#equipo' && voluntarios.datos) document.getElementById('equipo')?.scrollIntoView?.({ block: 'start' });
  }, [hash, voluntarios.datos]);

  const aviso = (mensaje) => { setOk(mensaje); setError(''); };
  const falla = (err) => { setError(textoError(err, productos.datos ?? [])); setOk(''); };

  function planificar(fecha, servicio) {
    setOk(''); setError('');
    setForm({ fecha, servicio });
  }

  async function editar(m) {
    setOk(''); setError('');
    try {
      const d = await api(`/menus/${m.id}`);
      setForm({
        id: m.id, fecha: m.fecha, servicio: m.servicio, nombrePlato: m.nombre_plato, raciones: String(m.raciones_planificadas),
        insumos: d.insumos.map((i) => ({ productoId: String(i.producto_id), total: String(Math.round(Number(i.cantidad_total) * 100) / 100) })),
      });
    } catch (err) {
      falla(err);
    }
  }

  async function verInsumos(id) {
    if (detalle?.id === id) return setDetalle(null);
    setDetalle({ id, cargando: true });
    try {
      const d = await api(`/menus/${id}`);
      setDetalle({ id, insumos: d.insumos });
    } catch (err) {
      setDetalle({ id, error: textoError(err) });
    }
  }

  async function ejecutarPendiente(m) {
    setProcesando(true);
    try {
      if (pendiente.tipo === 'confirmar') {
        await api(`/menus/${m.id}/confirmar`, { method: 'POST' });
        aviso(`Menú confirmado: "${m.nombre_plato}". Los insumos se descontaron de la despensa.`);
        productos.recargar();
      } else {
        await api(`/menus/${m.id}`, { method: 'DELETE' });
        aviso(`Se borró el menú "${m.nombre_plato}".`);
      }
      menus.recargar();
    } catch (err) {
      falla(err);
    } finally {
      setPendiente(null);
      setProcesando(false);
      setDetalle(null);
    }
  }

  async function asignar(datos) {
    try {
      await api('/voluntarios/turnos', { method: 'POST', body: datos });
      setAsignando(null);
      aviso('Turno asignado.');
      turnos.recargar();
    } catch (err) {
      if (err.status === 409) { setError('Esa persona ya está asignada a ese turno.'); setOk(''); } else falla(err);
    }
  }

  async function quitar(t) {
    try {
      await api(`/voluntarios/turnos/${t.id}`, { method: 'DELETE' });
      aviso(`Se quitó a ${t.voluntario} del turno.`);
      turnos.recargar();
    } catch (err) {
      falla(err);
    }
  }

  return (
    <section>
      <h1>Semana</h1>
      <p className="sub">{gestion ? 'Qué se cocina y quién ayuda, día por día.' : 'Qué se cocina y quién ayuda cada día.'}</p>
      <AyudaPlegable>
        {gestion ? (
          <ol>
            <li>Tocá <strong>Planificar</strong> en el día y servicio que quieras, y completá qué se cocina y para cuántas raciones.</li>
            <li>Cuando se cocina, tocá <strong>Confirmar menú</strong>: los ingredientes se descuentan de la despensa.</li>
            <li>Con <strong>+ Asignar</strong> elegís quién cocina y quién sirve. La × quita a alguien del turno.</li>
            <li>Si te equivocaste en un menú que todavía no confirmaste, podés <strong>Editar</strong> o <strong>Borrar</strong>.</li>
          </ol>
        ) : (
          <ol>
            <li>Acá ves el menú de cada día y quiénes cocinan y sirven.</li>
            <li>Usá las flechas para ver otras semanas.</li>
            <li>Para anotar cuántas raciones se sirvieron, andá a <strong>Raciones</strong>.</li>
          </ol>
        )}
      </AyudaPlegable>

      <SemanaNav
        lunes={lunes}
        onChange={(l) => {
          setLunes(l);
          // Al cambiar de semana se conserva el mismo día de la semana (o hoy, si está en esa semana)
          const nueva = semanaDe(l);
          setDiaSel(nueva.dias.includes(hoy) ? hoy : nueva.dias[Math.max(0, semana.dias.indexOf(diaSel))]);
          setAsignando(null);
          setDetalle(null);
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
              onClick={() => { setDiaSel(d); setAsignando(null); setDetalle(null); setPendiente(null); }}
            >
              <span>{fecha.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '')}</span>
              <strong>{fecha.getDate()}</strong>
              <i className={conMenu ? 'punto' : 'punto vacio'} aria-hidden="true" />
            </button>
          );
        })}
      </div>
      <Mensajes error={menus.error || turnos.error || productos.error || error} ok={ok} />

      <div ref={refForm}>
        {gestion && form && (
          <FormMenu
            inicial={form}
            productos={productos.datos ?? []}
            onProductoCreado={(m) => { aviso(m); productos.recargar(); }}
            onCancelar={() => setForm(null)}
            onListo={(m) => { setForm(null); aviso(m); menus.recargar(); }}
          />
        )}
      </div>
      {gestion && !form && (
        <button type="button" className="btn ancho" onClick={() => planificar(hoy, 'almuerzo')}>+ Planificar un menú</button>
      )}

      {(menus.cargando || turnos.cargando) && <Cargando />}
      {semana.dias.filter((d) => d === diaSel).map((dia) => (
        <div className={`dia${dia === hoy ? ' es-hoy' : ''}`} key={dia}>
          <h2>{fechaLegible(dia)}{dia === hoy && <span className="insignia confirmado"> Hoy</span>}</h2>
          {SERVICIOS.map((s) => {
            const m = menuPorClave[`${dia}|${s.valor}`];
            return (
              <div className="bloque" key={s.valor}>
                <h3>{s.texto}</h3>
                {m ? (
                  <>
                    <p className="plato">
                      {m.nombre_plato} · {m.raciones_planificadas} raciones{' '}
                      <span className={`insignia ${m.estado}`}>{m.estado === 'confirmado' ? 'Confirmado' : 'Planificado'}</span>
                    </p>
                    <div className="acciones-menu">
                      <button type="button" className="btn-link oscuro" aria-expanded={detalle?.id === m.id} onClick={() => verInsumos(m.id)}>
                        {detalle?.id === m.id ? 'Ocultar ingredientes' : 'Ver ingredientes'}
                      </button>
                      {gestion && m.estado === 'planificado' && pendiente?.id !== m.id && (
                        <>
                          <button type="button" className="mini" onClick={() => { setOk(''); setError(''); setPendiente({ tipo: 'confirmar', id: m.id }); }}>Confirmar menú</button>
                          <button type="button" className="mini" onClick={() => editar(m)}>Editar</button>
                          <button type="button" className="mini" onClick={() => { setOk(''); setError(''); setPendiente({ tipo: 'borrar', id: m.id }); }}>Borrar</button>
                        </>
                      )}
                    </div>
                    {detalle?.id === m.id && (
                      <div className="insumos" aria-live="polite">
                        {detalle.cargando && <span className="tenue">Cargando…</span>}
                        {detalle.error && <span className="error">{detalle.error}</span>}
                        {detalle.insumos?.length === 0 && <span className="tenue">Este menú no tiene ingredientes cargados.</span>}
                        {detalle.insumos?.length > 0 && (
                          <ul>
                            {detalle.insumos.map((i) => (
                              <li key={i.producto_id}><strong>{i.nombre}</strong>: {num(i.cantidad_total)} {i.unidad} en total ({num(i.cantidad_por_racion)} por ración)</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    {gestion && pendiente?.id === m.id && (
                      <div className="confirmar" role="group" aria-label={`${pendiente.tipo === 'confirmar' ? 'Confirmar' : 'Borrar'} ${m.nombre_plato}`}>
                        <p>{pendiente.tipo === 'confirmar'
                          ? 'Se van a descontar los ingredientes de la despensa. ¿Confirmar el menú?'
                          : '¿Seguro que querés borrar este menú? No se puede deshacer.'}</p>
                        <button type="button" className="btn" disabled={procesando} onClick={() => ejecutarPendiente(m)}>
                          {pendiente.tipo === 'confirmar' ? 'Sí, confirmar' : 'Sí, borrar'}
                        </button>
                        <button type="button" className="btn-sec" onClick={() => setPendiente(null)}>Cancelar</button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="tenue">
                    Sin menú planificado.{' '}
                    {gestion && <button type="button" className="mini" onClick={() => planificar(dia, s.valor)}>Planificar</button>}
                  </p>
                )}
                <TurnosBloque
                  fecha={dia} servicio={s.valor} turnos={turnosPorClave[`${dia}|${s.valor}`] ?? []} gestion={gestion}
                  voluntarios={voluntarios.datos ?? []} asignando={asignando} setAsignando={setAsignando}
                  onQuitar={quitar} onAsignar={asignar}
                />
              </div>
            );
          })}
        </div>
      ))}

      {gestion && (
        <EquipoVoluntarios
          voluntarios={voluntarios.datos ?? []}
          onCambio={(m) => { aviso(m); voluntarios.recargar(); turnos.recargar(); }}
        />
      )}
    </section>
  );
}
