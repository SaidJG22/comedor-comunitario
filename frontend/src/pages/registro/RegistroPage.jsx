import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useSesion } from '../../store/sesion.js';
import { Entrada, Mensajes } from '../../components/Campos.jsx';
import IngresoLayout from '../../layout/IngresoLayout.jsx';
import { textoError } from '../../utils/errores.js';

/** Registro */
export default function RegistroPage() {
  const { usuario } = useSesion();
  const [f, setF] = useState({ nombre: '', email: '', password: '', repetir: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);

  if (usuario) return <Navigate to="/" replace />;

  const cambiar = (campo) => (e) => setF({ ...f, [campo]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setError('');
    if (f.password !== f.repetir) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setEnviando(true);
    try {
      await api('/auth/registro', { method: 'POST', body: { nombre: f.nombre.trim(), email: f.email.trim(), password: f.password } });
      setListo(true);
    } catch (err) {
      setError(textoError(err));
    } finally {
      setEnviando(false);
    }
  }

  if (listo) {
    return (
      <IngresoLayout>
        <h1>¡Listo!</h1>
        <p className="sub" role="status">
          Tu cuenta quedó <strong>pendiente</strong>. El administrador del comedor la tiene que activar; después vas a poder
          ingresar con tu correo y tu contraseña.
        </p>
        <Link to="/login" className="btn btn-primary ancho">Ir a ingresar</Link>
      </IngresoLayout>
    );
  }

  return (
    <IngresoLayout>
      <h1>Crear una cuenta</h1>
      <p className="sub">Para quienes ayudan en el comedor. El administrador la activa antes de que puedas entrar.</p>
      <form onSubmit={enviar}>
        <Entrada label="Nombre" required maxLength={80} autoComplete="name" value={f.nombre} onChange={cambiar('nombre')} />
        <Entrada label="Correo electrónico" type="email" required maxLength={120} autoComplete="email" placeholder="nombre@correo.com"
                 value={f.email} onChange={cambiar('email')} />
        <Entrada label="Contraseña" type="password" required minLength={8} maxLength={72} autoComplete="new-password"
                 ayuda="Al menos 8 caracteres." value={f.password} onChange={cambiar('password')} />
        <Entrada label="Repetir la contraseña" type="password" required minLength={8} maxLength={72} autoComplete="new-password"
                 value={f.repetir} onChange={cambiar('repetir')} />
        <Mensajes error={error} />
        <button type="submit" className="btn btn-primary" disabled={enviando}>{enviando ? 'Creando la cuenta…' : 'Crear cuenta'}</button>
      </form>
      <p className="login-pie">¿Ya tenés cuenta? <Link to="/login" className="btn-link oscuro">Ingresar</Link></p>
    </IngresoLayout>
  );
}
