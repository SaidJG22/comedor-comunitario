import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAviso } from '../../components/Avisos.jsx';
import { Cargando, Entrada, Mensajes } from '../../components/Campos.jsx';
import EncabezadoPagina from '../../components/EncabezadoPagina.jsx';
import NoDisponible from '../../components/NoDisponible.jsx';
import { useCarga } from '../../hooks/useCarga.js';
import { textoError } from '../../utils/errores.js';

function FormVoluntario({ voluntario, onListo, onCancelar }) {
  const editando = Boolean(voluntario);
  const [nombre, setNombre] = useState(voluntario?.nombre_visible ?? '');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      if (editando) {
        await api(`/voluntarios/${voluntario.id}`, { method: 'PATCH', body: { nombreVisible: nombre.trim() } });
        onListo(`Se cambió el nombre a ${nombre.trim()}.`);
      } else {
        await api('/voluntarios', { method: 'POST', body: { nombreVisible: nombre.trim() } });
        onListo(`Se agregó a ${nombre.trim()} al equipo.`);
      }
    } catch (err) {
      setError(textoError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} aria-label={editando ? 'Editar voluntario' : 'Nuevo voluntario'}>
      <Entrada label="Nombre o apodo" required maxLength={80} value={nombre} placeholder="Ej.: Luis"
               ayuda="Alcanza con un nombre para reconocerlo/a. No cargues documento ni otros datos personales."
               onChange={(e) => setNombre(e.target.value)} />
      <Mensajes error={error} />
      <div className="modal-pie">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={enviando}>{enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Agregar al equipo'}</button>
      </div>
    </form>
  );
}

/** Pantalla de voluntario */
export default function VoluntarioFormPage() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const avisar = useAviso();
  const voluntario = useCarga(editando ? `/voluntarios/${id}` : null);
  const volver = () => navigate('/semana/equipo');

  if (editando && !voluntario.datos) {
    return voluntario.error ? <NoDisponible mensaje={voluntario.error} volver={volver} /> : <Cargando />;
  }

  return (
    <div className="form-pagina">
      <EncabezadoPagina
        nivel={2}
        titulo={editando ? `Editar a ${voluntario.datos.nombre_visible}` : 'Agregar voluntario'}
        descripcion="Solo un nombre o apodo para reconocerlo/a en los turnos."
      />
      <div className="panel">
        <FormVoluntario key={id ?? 'nuevo'} voluntario={voluntario.datos ?? undefined}
                        onListo={(mensaje) => { avisar(mensaje); volver(); }} onCancelar={volver} />
      </div>
    </div>
  );
}
