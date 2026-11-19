import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { sesion } from '../../api/client.js';
import { useSesion } from '../../store/sesion.js';
import IngresoLayout from '../../layout/IngresoLayout.jsx';

export default function LoginPage() {
  const { usuario, login } = useSesion();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [aviso] = useState(() => sesion.tomarAviso());
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to="/" replace />;

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      // Cuenta pendiente
      setError(err.status === 401 ? 'El correo o la contraseña no son correctos. Revisalos e intentá de nuevo.' : err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <IngresoLayout>
      <h1>Ingresar</h1>
      <p className="sub">Con tu correo y tu contraseña.</p>
      {aviso && <p role="status" className="alert alert-warning aviso">{aviso}</p>}
      <form onSubmit={enviar}>
        <label className="campo">
          <span className="form-label">Correo electrónico</span>
          <input className="form-control" type="email" autoComplete="username" value={email} placeholder="nombre@correo.com"
                 onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="campo">
          <span className="form-label">Contraseña</span>
          <input className="form-control" type="password" autoComplete="current-password" value={password}
                 onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p role="alert" className="error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
      <p className="login-pie">¿No tenés cuenta? <Link to="/registro" className="btn-link oscuro">Registrate</Link></p>
      <p className="tenue">¿Olvidaste tu contraseña? Pedile al administrador del comedor que te la restablezca.</p>
    </IngresoLayout>
  );
}
