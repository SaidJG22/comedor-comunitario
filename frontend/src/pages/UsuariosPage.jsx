import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { ROLES, useAuth } from '../auth/AuthContext.jsx';
import { Cargando, Entrada, Lista, Mensajes, Vacio } from '../components/Campos.jsx';
import { useCarga } from '../hooks/useCarga.js';
import { textoError } from '../utils/errores.js';

const OPCIONES_ROL = Object.values(ROLES).map((r) => ({ valor: r, texto: r }));
const inicial = { nombre: '', email: '', password: '', rol: ROLES.VOLUNTARIO };

export default function UsuariosPage() {
  const { usuario: yo } = useAuth();
  const usuarios = useCarga('/usuarios');
  const [f, setF] = useState(inicial);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [reset, setReset] = useState(null); // { id, password, repetir } del usuario al que se le restablece la clave

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setOk('');
    setEnviando(true);
    try {
      await api('/usuarios', { method: 'POST', body: { ...f, nombre: f.nombre.trim(), email: f.email.trim() } });
      setOk(`Se creó el usuario de ${f.nombre.trim()}.`);
      setF(inicial);
      usuarios.recargar();
    } catch (err) {
      setError(err.status === 409 ? 'Ya existe un usuario con ese correo.' : textoError(err));
    } finally {
      setEnviando(false);
    }
  }

  async function cambiar(u, cambio, mensaje) {
    setError('');
    setOk('');
    try {
      await api(`/usuarios/${u.id}`, { method: 'PATCH', body: cambio });
      setOk(mensaje);
      usuarios.recargar();
    } catch (err) {
      setError(textoError(err));
    }
  }

  async function restablecer(e, u) {
    e.preventDefault();
    setError('');
    setOk('');
    if (reset.password !== reset.repetir) {
      setError('Las dos contraseñas no coinciden.');
      return;
    }
    try {
      await api(`/usuarios/${u.id}/password`, { method: 'PATCH', body: { password: reset.password } });
      setOk(`Se restableció la contraseña de ${u.nombre}. Avisale cuál es la nueva para que pueda entrar.`);
      setReset(null);
    } catch (err) {
      setError(textoError(err));
    }
  }

  const lista = usuarios.datos ?? [];
  return (
    <section>
      <Link to="/cuenta" className="volver">← Mi cuenta</Link>
      <h1>Usuarios y roles</h1>
      <p className="sub">Quién puede entrar al sistema y qué puede hacer.</p>

      <form className="panel" onSubmit={enviar} aria-label="Nuevo usuario">
        <h2>Nuevo usuario</h2>
        <Entrada label="Nombre" required maxLength={80} value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} />
        <Entrada label="Correo electrónico" type="email" required autoComplete="off" value={f.email}
                 onChange={(e) => setF({ ...f, email: e.target.value })} />
        <Entrada label="Contraseña inicial" type="password" required minLength={8} autoComplete="new-password"
                 ayuda="Mínimo 8 caracteres." value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <Lista label="Rol" opciones={OPCIONES_ROL} vacio="" value={f.rol} onChange={(e) => setF({ ...f, rol: e.target.value })}
               ayuda="Voluntario: carga raciones y ve turnos. Responsable: además gestiona stock, donaciones, menús y reportes." />
        <Mensajes error={error} ok={ok} />
        <button type="submit" className="btn" disabled={enviando}>{enviando ? 'Guardando…' : 'Crear usuario'}</button>
      </form>

      <h2 className="seccion">Usuarios</h2>
      {usuarios.error && <Mensajes error={usuarios.error} />}
      {usuarios.cargando && <Cargando />}
      <ul className="lista">
        {lista.map((u) => {
          const activo = Boolean(u.activo);
          const esYo = u.id === yo.id;
          return (
            <li key={u.id} className={activo ? '' : 'inactivo'}>
              <span>
                {u.nombre}
                <small className="tenue"> · {u.email}</small>
                {!activo && <span className="insignia planificado"> Inactivo</span>}
              </span>
              {esYo ? (
                <span className="tenue">{u.rol} · sos vos</span>
              ) : (
                <span className="acciones">
                  <select aria-label={`Rol de ${u.nombre}`} value={u.rol}
                          onChange={(e) => cambiar(u, { rol: e.target.value }, `${u.nombre} ahora es ${e.target.value}.`)}>
                    {OPCIONES_ROL.map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
                  </select>
                  <button type="button" className="mini" aria-label={`${activo ? 'Desactivar' : 'Activar'} a ${u.nombre}`}
                          onClick={() => cambiar(u, { activo: !activo }, activo ? `${u.nombre} ya no puede entrar.` : `${u.nombre} puede volver a entrar.`)}>
                    {activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button type="button" className="mini" aria-label={`Restablecer la contraseña de ${u.nombre}`}
                          onClick={() => { setOk(''); setError(''); setReset({ id: u.id, password: '', repetir: '' }); }}>
                    Restablecer contraseña
                  </button>
                </span>
              )}
              {reset?.id === u.id && (
                <form className="restablecer" onSubmit={(e) => restablecer(e, u)} aria-label={`Nueva contraseña para ${u.nombre}`}>
                  <Entrada label={`Nueva contraseña para ${u.nombre}`} type="password" autoComplete="new-password" required minLength={8}
                           ayuda="Mínimo 8 caracteres." value={reset.password} onChange={(e) => setReset({ ...reset, password: e.target.value })} />
                  <Entrada label="Repetila" type="password" autoComplete="new-password" required minLength={8}
                           value={reset.repetir} onChange={(e) => setReset({ ...reset, repetir: e.target.value })} />
                  <button type="submit" className="btn">Guardar nueva contraseña</button>
                  <button type="button" className="btn-link oscuro" onClick={() => setReset(null)}>Cancelar</button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
      {!usuarios.cargando && !usuarios.error && lista.length === 0 && <Vacio>No hay usuarios cargados.</Vacio>}
    </section>
  );
}
