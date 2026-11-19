import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAviso } from '../../components/Avisos.jsx';
import { Cargando, Entrada, Mensajes } from '../../components/Campos.jsx';
import EncabezadoPagina from '../../components/EncabezadoPagina.jsx';
import NoDisponible from '../../components/NoDisponible.jsx';
import { useCarga } from '../../hooks/useCarga.js';
import { textoError } from '../../utils/errores.js';

function FormContrasena({ usuario, onListo, onCancelar }) {
  const [f, setF] = useState({ password: '', repetir: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError('');
    if (f.password !== f.repetir) {
      setError('Las dos contraseñas no coinciden.');
      return;
    }
    setEnviando(true);
    try {
      await api(`/usuarios/${usuario.id}/password`, { method: 'PATCH', body: { password: f.password } });
      onListo(`Se restableció la contraseña de ${usuario.nombre}. Avisale cuál es la nueva para que pueda entrar.`);
    } catch (err) {
      setError(textoError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} aria-label={`Nueva contraseña para ${usuario.nombre}`}>
      <Entrada label="Nueva contraseña" type="password" autoComplete="new-password" required minLength={8}
               ayuda="Mínimo 8 caracteres." value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      <Entrada label="Repetila" type="password" autoComplete="new-password" required minLength={8}
               value={f.repetir} onChange={(e) => setF({ ...f, repetir: e.target.value })} />
      <Mensajes error={error} />
      <div className="modal-pie">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar nueva contraseña'}</button>
      </div>
    </form>
  );
}

/** Restablecer contraseña */
export default function ContrasenaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const avisar = useAviso();
  const usuario = useCarga(`/usuarios/${id}`);
  const volver = () => navigate('/usuarios');

  if (!usuario.datos) return usuario.error ? <NoDisponible mensaje={usuario.error} volver={volver} /> : <Cargando />;

  return (
    <div className="form-pagina">
      <EncabezadoPagina titulo={`Nueva contraseña para ${usuario.datos.nombre}`} descripcion="Después avisale cuál es para que pueda entrar." />
      <div className="panel">
        <FormContrasena usuario={usuario.datos} onListo={(mensaje) => { avisar(mensaje); volver(); }} onCancelar={volver} />
      </div>
    </div>
  );
}
