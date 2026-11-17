import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { ROLES, useAuth } from '../auth/AuthContext.jsx';
import { Entrada, Mensajes } from '../components/Campos.jsx';
import Selector from '../components/Selector.jsx';
import { TAMANOS } from '../hooks/useTamanoLetra.js';
import { textoError } from '../utils/errores.js';

/** Mi cuenta: cambiar la contraseña, el tamaño de letra y (administrador) ir a Usuarios. */
export default function CuentaPage({ letra }) {
  const { usuario, logout } = useAuth();
  const [f, setF] = useState({ actual: '', nueva: '', repetir: '' });
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function cambiar(e) {
    e.preventDefault();
    setError('');
    setOk('');
    if (f.nueva !== f.repetir) {
      setError('Las dos contraseñas nuevas no coinciden. Escribilas de nuevo.');
      return;
    }
    setEnviando(true);
    try {
      await api('/auth/password', { method: 'PATCH', body: { actual: f.actual, nueva: f.nueva } });
      setOk('Listo: tu contraseña fue cambiada. La próxima vez ingresá con la nueva.');
      setF({ actual: '', nueva: '', repetir: '' });
    } catch (err) {
      setError(textoError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section>
      <h1>Mi cuenta</h1>
      <p className="sub">{usuario.nombre} · {usuario.rol}</p>

      {usuario.rol === ROLES.ADMIN && (
        <Link to="/usuarios" className="tarjeta ancho-enlace">Usuarios y roles: quién puede entrar y qué puede hacer →</Link>
      )}

      <h2 className="seccion">Tamaño de letra</h2>
      <Selector etiqueta="Tamaño de letra" opciones={TAMANOS.map((t) => ({ valor: t.valor, texto: t.texto }))}
                valor={letra.tamano} onChange={letra.setTamano} />

      <form className="panel" onSubmit={cambiar} aria-label="Cambiar contraseña">
        <h2>Cambiar mi contraseña</h2>
        <Entrada label="Contraseña actual" type="password" autoComplete="current-password" required value={f.actual}
                 onChange={(e) => setF({ ...f, actual: e.target.value })} />
        <Entrada label="Contraseña nueva" type="password" autoComplete="new-password" required minLength={8}
                 ayuda="Mínimo 8 caracteres." value={f.nueva} onChange={(e) => setF({ ...f, nueva: e.target.value })} />
        <Entrada label="Repetí la contraseña nueva" type="password" autoComplete="new-password" required minLength={8}
                 value={f.repetir} onChange={(e) => setF({ ...f, repetir: e.target.value })} />
        <Mensajes error={error} ok={ok} />
        <button type="submit" className="btn" disabled={enviando}>{enviando ? 'Guardando…' : 'Cambiar contraseña'}</button>
      </form>

      <button type="button" className="btn-sec ancho" onClick={logout}>Cerrar sesión</button>
    </section>
  );
}
