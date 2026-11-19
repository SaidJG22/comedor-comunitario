import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';
import AccionesFila from '../../components/AccionesFila.jsx';
import AyudaPlegable from '../../components/AyudaPlegable.jsx';
import { useAviso } from '../../components/Avisos.jsx';
import { Cargando, Mensajes, Vacio } from '../../components/Campos.jsx';
import { useConfirmar } from '../../components/Confirmar.jsx';
import EncabezadoPagina from '../../components/EncabezadoPagina.jsx';
import { useCarga } from '../../hooks/useCarga.js';
import { textoError } from '../../utils/errores.js';

/** Voluntarios */
export default function VoluntariosPage() {
  const voluntarios = useCarga('/voluntarios?todos=1');
  const avisar = useAviso();
  const confirmar = useConfirmar();
  const navigate = useNavigate();
  const [verBajas, setVerBajas] = useState(false);

  const todos = voluntarios.datos ?? [];
  const activos = todos.filter((v) => v.activo);
  const bajas = todos.filter((v) => !v.activo);
  const visibles = verBajas ? [...activos, ...bajas] : activos;
  const nuevo = () => navigate('/semana/equipo/nuevo');

  async function cambiarEstado(v, activo) {
    if (!activo) {
      const si = await confirmar({
        titulo: `¿Dar de baja a ${v.nombre_visible}?`,
        mensaje: 'Deja de aparecer para asignar turnos. Los turnos que ya tenía se conservan. Podés reactivarlo cuando quieras.',
        textoSi: 'Sí, dar de baja',
        peligro: true,
      });
      if (!si) return;
    }
    try {
      await api(`/voluntarios/${v.id}`, { method: 'PATCH', body: { activo } });
      avisar(activo ? `${v.nombre_visible} volvió al equipo.` : `${v.nombre_visible} ya no figura en el equipo.`);
      voluntarios.recargar();
    } catch (err) {
      avisar(textoError(err), 'error');
    }
  }

  // Solo sin turnos
  async function borrar(v) {
    const si = await confirmar({
      titulo: `¿Borrar a ${v.nombre_visible}?`,
      mensaje: 'Se borra definitivamente: todavía no tiene turnos asignados.',
      textoSi: 'Sí, borrar',
      peligro: true,
    });
    if (!si) return;
    try {
      await api(`/voluntarios/${v.id}`, { method: 'DELETE' });
      avisar(`Se borró a ${v.nombre_visible}.`);
      voluntarios.recargar();
    } catch (err) {
      avisar(textoError(err), 'error');
    }
  }

  return (
    <div>
      <EncabezadoPagina
        nivel={2}
        titulo="Equipo de voluntarios"
        descripcion={voluntarios.datos ? `${activos.length} ${activos.length === 1 ? 'persona activa' : 'personas activas'}` : undefined}
        accion={{ texto: 'Agregar voluntario', onClick: nuevo }}
      />
      <AyudaPlegable>
        <ol>
          <li>Con <strong>Agregar voluntario</strong> sumás a alguien al equipo: alcanza con un nombre o apodo.</li>
          <li>Después lo asignás a cocina o servicio desde la pestaña <strong>Menús</strong>.</li>
          <li><strong>Dar de baja</strong> lo saca de las listas sin perder sus turnos anteriores; se puede reactivar. Si todavía no tuvo turnos, se puede <strong>Borrar</strong>.</li>
        </ol>
      </AyudaPlegable>
      <Mensajes error={voluntarios.error} />
      {voluntarios.cargando && !voluntarios.datos && <Cargando />}

      {visibles.length > 0 && (
        <ul className="lista">
          {visibles.map((v) => (
            <li key={v.id} className={`fila${v.activo ? '' : ' inactivo'}`}>
              <div className="fila-info">
                <span className="fila-titulo">
                  {v.nombre_visible}
                  {!v.activo && <span className="badge rounded-pill insignia neutra">Dado de baja</span>}
                </span>
              </div>
              <AccionesFila
                acciones={[
                  v.activo && { texto: 'Editar', icono: 'editar', etiqueta: `Editar a ${v.nombre_visible}`, onClick: () => navigate(`/semana/equipo/${v.id}/editar`) },
                  !v.activo && { texto: 'Reactivar', icono: 'reactivar', etiqueta: `Reactivar a ${v.nombre_visible}`, onClick: () => cambiarEstado(v, true) },
                  // Baja o borrar
                  Number(v.tiene_turnos)
                    ? v.activo && { texto: 'Dar de baja', icono: 'baja', peligro: true, etiqueta: `Dar de baja a ${v.nombre_visible}`, onClick: () => cambiarEstado(v, false) }
                    : { texto: 'Borrar', icono: 'borrar', peligro: true, etiqueta: `Borrar a ${v.nombre_visible}`, onClick: () => borrar(v) },
                ]}
              />
            </li>
          ))}
        </ul>
      )}
      {voluntarios.datos && activos.length === 0 && !verBajas && (
        <Vacio icono="usuarios" accion={{ texto: 'Agregar voluntario', onClick: nuevo }}>
          Todavía no hay voluntarios en el equipo.
        </Vacio>
      )}
      {bajas.length > 0 && (
        <button type="button" className="btn-link oscuro separado" onClick={() => setVerBajas((x) => !x)}>
          {verBajas ? 'Ocultar los dados de baja' : `Ver los dados de baja (${bajas.length})`}
        </button>
      )}
    </div>
  );
}
