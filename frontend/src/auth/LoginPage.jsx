import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { sesion } from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

export default function LoginPage() {
  const { usuario, login } = useAuth();
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
      setError(err.status === 401 ? 'El correo o la contraseña no son correctos. Revisalos e intentá de nuevo.' : err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="login">
      <h1>Mesa Abierta</h1>
      <p className="sub">Gestión del comedor comunitario</p>
      {aviso && <p role="status" className="aviso">{aviso}</p>}
      <form onSubmit={enviar}>
        <label>
          Correo electrónico
          <input type="email" autoComplete="username" value={email} placeholder="nombre@correo.com"
                 onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Contraseña
          <input type="password" autoComplete="current-password" value={password}
                 onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p role="alert" className="error">{error}</p>}
        <button type="submit" className="btn" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
      <p className="tenue">¿Olvidaste tu contraseña? Pedile al administrador del comedor que te la restablezca.</p>
    </main>
  );
}
