import Portada from '../components/Portada.jsx';

/** Ingreso y registro */
export default function IngresoLayout({ children }) {
  return (
    <main className="login-fondo">
      {/* Foto */}
      <Portada src="/imagenes/portada.jpg" className="login-portada" />
      <div className="login-lado">
        <div className="login">
          <img src="/imagenes/logo-completo.jpg" alt="ComeTUC, comedor comunitario" className="login-logo" width="560" height="593" />
          {children}
        </div>
      </div>
    </main>
  );
}
