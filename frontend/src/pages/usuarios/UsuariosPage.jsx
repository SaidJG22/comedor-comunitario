import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useSesion } from '../../store/sesion.js';
import AccionesFila from '../../components/AccionesFila.jsx';
import { useAviso } from '../../components/Avisos.jsx';
import { Cargando, Mensajes, Vacio } from '../../components/Campos.jsx';
import { useConfirmar } from '../../components/Confirmar.jsx';
import EncabezadoPagina from '../../components/EncabezadoPagina.jsx';
import { useCarga } from '../../hooks/useCarga.js';
import { textoError } from '../../utils/errores.js';

export default function UsuariosPage() {
  const { usuario: yo } = useSesion();
  const usuarios = useCarga('/usuarios');
  const avisar = useAviso();
  const confirmar = useConfirmar();
  const navigate = useNavigate();

  async function cambiarEstado(u, activo) {
    const si = await confirmar(
      activo
        ? { titulo: `¿Activar a ${u.nombre}?`, mensaje: 'Va a poder entrar al sistema con su correo y su contraseña.', textoSi: 'Sí, activar' }
        : {
            titulo: `¿Desactivar a ${u.nombre}?`,
            mensaje: 'No va a poder entrar al sistema. Lo que cargó se conserva. Podés activarlo de nuevo cuando quieras.',
            textoSi: 'Sí, desactivar',
            peligro: true,
          },
    );
    if (!si) return;
    try {
      await api(`/usuarios/${u.id}`, { method: 'PATCH', body: { activo } });
      avisar(activo ? `${u.nombre} ya puede entrar.` : `${u.nombre} ya no puede entrar.`);
      usuarios.recargar();
    } catch (err) {
      avisar(textoError(err), 'error');
    }
  }

  // Solo sin registros
  async function borrar(u) {
    const si = await confirmar({
      titulo: `¿Borrar la cuenta de ${u.nombre}?`,
      mensaje: u.activo
        ? 'Se borra definitivamente: todavía no cargó nada en el sistema.'
        : 'Se borra definitivamente. Si es un registro que no reconocés, así lo rechazás.',
      textoSi: 'Sí, borrar',
      peligro: true,
    });
    if (!si) return;
    try {
      await api(`/usuarios/${u.id}`, { method: 'DELETE' });
      avisar(`Se borró la cuenta de ${u.nombre}.`);
      usuarios.recargar();
    } catch (err) {
      avisar(textoError(err), 'error');
    }
  }

  const lista = usuarios.datos ?? [];
  const inactivos = lista.filter((u) => !u.activo).length;

  return (
    <section>
      <Link to="/cuenta" className="volver">← Mi cuenta</Link>
      <EncabezadoPagina
        titulo="Usuarios y roles"
        descripcion="Quién puede entrar al sistema y qué puede hacer."
        accion={{ texto: 'Nuevo usuario', onClick: () => navigate('/usuarios/nuevo') }}
      />
      {inactivos > 0 && (
        <p className="alert alert-warning aviso" role="status">
          {inactivos === 1 ? 'Hay 1 cuenta inactiva.' : `Hay ${inactivos} cuentas inactivas.`} Las que se crean desde “Registrarse” aparecen así
          hasta que las actives con <strong>Activar</strong>.
        </p>
      )}
      {usuarios.error && <Mensajes error={usuarios.error} />}
      {usuarios.cargando && !usuarios.datos && <Cargando />}
      <ul className="lista">
        {lista.map((u) => {
          const activo = Boolean(u.activo);
          const esYo = u.id === yo.id;
          const sePuedeBorrar = !esYo && !Number(u.tiene_registros);
          return (
            <li key={u.id} className={`fila${activo ? '' : ' inactivo'}`}>
              <div className="fila-info">
                <span className="fila-titulo">
                  {u.nombre}
                  {esYo && <span className="badge rounded-pill insignia info">Vos</span>}
                  {!activo && <span className="badge rounded-pill insignia neutra">Inactivo</span>}
                </span>
                <span className="fila-detalle">{u.email} · {u.rol}</span>
              </div>
              <AccionesFila
                acciones={[
                  { texto: 'Editar', icono: 'editar', etiqueta: `Editar a ${u.nombre}`, onClick: () => navigate(`/usuarios/${u.id}/editar`) },
                  !esYo && { texto: 'Contraseña', icono: 'llave', etiqueta: `Restablecer la contraseña de ${u.nombre}`, onClick: () => navigate(`/usuarios/${u.id}/contrasena`) },
                  !esYo && (activo
                    ? { texto: 'Desactivar', icono: 'baja', peligro: true, etiqueta: `Desactivar a ${u.nombre}`, onClick: () => cambiarEstado(u, false) }
                    : { texto: 'Activar', icono: 'reactivar', etiqueta: `Activar a ${u.nombre}`, onClick: () => cambiarEstado(u, true) }),
                  // Borrar usuario
                  sePuedeBorrar && { texto: 'Borrar', icono: 'borrar', peligro: true, etiqueta: `Borrar la cuenta de ${u.nombre}`, onClick: () => borrar(u) },
                ]}
              />
            </li>
          );
        })}
      </ul>
      {!usuarios.cargando && !usuarios.error && lista.length === 0 && <Vacio icono="usuarios">No hay usuarios cargados.</Vacio>}
    </section>
  );
}
