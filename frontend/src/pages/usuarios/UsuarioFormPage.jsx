import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import { ROLES } from '../../auth/roles.js';
import { useSesion } from '../../store/sesion.js';
import { useAviso } from '../../components/Avisos.jsx';
import { Cargando, Entrada, Lista, Mensajes } from '../../components/Campos.jsx';
import EncabezadoPagina from '../../components/EncabezadoPagina.jsx';
import NoDisponible from '../../components/NoDisponible.jsx';
import { useCarga } from '../../hooks/useCarga.js';
import { textoError } from '../../utils/errores.js';

const OPCIONES_ROL = Object.values(ROLES).map((r) => ({ valor: r, texto: r }));
const AYUDA_ROL = 'Voluntario: carga raciones y ve turnos. Responsable: además gestiona stock, donaciones, menús e informes. Administrador: todo, incluidos los usuarios.';

/** Formulario de usuario */
function FormUsuario({ usuario, esYo, onListo, onCancelar }) {
  const editando = Boolean(usuario);
  const [f, setF] = useState(() =>
    editando
      ? { nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
      : { nombre: '', email: '', password: '', rol: ROLES.VOLUNTARIO },
  );
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    const datos = { nombre: f.nombre.trim(), email: f.email.trim() };
    try {
      if (editando) {
        // Rol propio fijo
        const body = esYo || f.rol === usuario.rol ? datos : { ...datos, rol: f.rol };
        await api(`/usuarios/${usuario.id}`, { method: 'PATCH', body });
        onListo(esYo
          ? 'Se guardaron tus datos. El nombre nuevo se ve arriba la próxima vez que ingreses.'
          : `Se guardaron los cambios de ${datos.nombre}.`);
      } else {
        await api('/usuarios', { method: 'POST', body: { ...datos, password: f.password, rol: f.rol } });
        onListo(`Se creó el usuario de ${datos.nombre}.`);
      }
    } catch (err) {
      setError(err.status === 409 ? 'Ya existe un usuario con ese correo.' : textoError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} aria-label={editando ? `Editar a ${usuario.nombre}` : 'Nuevo usuario'}>
      <Entrada label="Nombre" required maxLength={80} value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} />
      <Entrada label="Correo electrónico" type="email" required autoComplete="off" value={f.email}
               onChange={(e) => setF({ ...f, email: e.target.value })} />
      {!editando && (
        <Entrada label="Contraseña inicial" type="password" required minLength={8} autoComplete="new-password"
                 ayuda="Mínimo 8 caracteres." value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      )}
      <Lista label="Rol" opciones={OPCIONES_ROL} vacio="" value={f.rol} disabled={esYo}
             ayuda={esYo ? 'No podés cambiar tu propio rol.' : AYUDA_ROL}
             onChange={(e) => setF({ ...f, rol: e.target.value })} />
      <Mensajes error={error} />
      <div className="modal-pie">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear usuario'}
        </button>
      </div>
    </form>
  );
}

/** Pantalla de usuario */
export default function UsuarioFormPage() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const avisar = useAviso();
  const { usuario: yo } = useSesion();
  const usuario = useCarga(editando ? `/usuarios/${id}` : null);
  const volver = () => navigate('/usuarios');

  if (editando && !usuario.datos) {
    return usuario.error ? <NoDisponible mensaje={usuario.error} volver={volver} /> : <Cargando />;
  }

  return (
    <div className="form-pagina">
      <EncabezadoPagina
        titulo={editando ? `Editar a ${usuario.datos.nombre}` : 'Nuevo usuario'}
        descripcion={editando ? 'Nombre, correo y rol.' : 'Quién va a poder entrar al sistema y qué va a poder hacer.'}
      />
      <div className="panel">
        <FormUsuario key={id ?? 'nuevo'} usuario={usuario.datos ?? undefined} esYo={usuario.datos?.id === yo.id}
                     onListo={(mensaje) => { avisar(mensaje); volver(); }} onCancelar={volver} />
      </div>
    </div>
  );
}
