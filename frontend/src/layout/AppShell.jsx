import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { GESTION } from '../auth/roles.js';
import { useSesion } from '../store/sesion.js';
import Icono from '../components/Iconos.jsx';

// Secciones
const SECCIONES = [
  { to: '/', texto: 'Inicio', icono: 'inicio', fin: true },
  { to: '/raciones', texto: 'Raciones', icono: 'raciones' },
  { to: '/despensa', texto: 'Despensa', icono: 'despensa', roles: GESTION },
  { to: '/semana', texto: 'Semana', icono: 'semana' },
  { to: '/informes', texto: 'Informes', icono: 'informes', roles: GESTION },
];

/** Estructura */
export default function AppShell() {
  const { usuario, logout } = useSesion();
  const visibles = SECCIONES.filter((s) => !s.roles || s.roles.includes(usuario.rol));
  const { pathname } = useLocation();

  // Volver arriba
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="shell">
      <header className="cabecera">
        <div className="topbar">
          <Link to="/" className="marca" aria-label="ComeTUC, ir a Inicio">
            <img src="/imagenes/logo-simbolo.jpg" alt="" className="marca-simbolo" width="40" height="40" />
            <img src="/imagenes/logo-nombre.jpg" alt="ComeTUC" className="marca-nombre" width="114" height="22" />
          </Link>
          <nav className="pestanas" aria-label="Secciones">
            {visibles.map((s) => (
              <NavLink key={s.to} to={s.to} end={s.fin}>
                <Icono nombre={s.icono} />
                <span>{s.texto}</span>
              </NavLink>
            ))}
          </nav>
          <div className="cuenta-zona">
            <Link to="/cuenta" className="cuenta-enlace" aria-label={`Mi cuenta: ${usuario.nombre}, ${usuario.rol}`}>
              <Icono nombre="cuenta" tamano={20} />
              <span>{usuario.nombre}</span>
            </Link>
            <button type="button" className="btn-link" onClick={logout}>Salir</button>
          </div>
        </div>
      </header>
      <main className="contenido">
        <Outlet />
      </main>
    </div>
  );
}
