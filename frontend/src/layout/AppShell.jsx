import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { GESTION, useAuth } from '../auth/AuthContext.jsx';
import Icono from '../components/Iconos.jsx';

// Secciones agrupadas por tareas. Voluntario: Inicio, Raciones y Semana (solo lectura).
const SECCIONES = [
  { to: '/', texto: 'Inicio', icono: 'inicio', fin: true },
  { to: '/raciones', texto: 'Raciones', icono: 'raciones' },
  { to: '/despensa', texto: 'Despensa', icono: 'despensa', roles: GESTION },
  { to: '/semana', texto: 'Semana', icono: 'semana' },
  { to: '/informes', texto: 'Informes', icono: 'informes', roles: GESTION },
];

/** Estructura general: cabecera fija arriba (marca, cuenta y navegación) y contenido debajo. */
export default function AppShell({ letra }) {
  const { usuario, logout } = useAuth();
  const { pathname } = useLocation();
  const nav = useRef(null);
  const visibles = SECCIONES.filter((s) => !s.roles || s.roles.includes(usuario.rol));

  // Si la barra se desplaza (letra grande o pantalla angosta), mantiene visible la sección activa.
  useEffect(() => {
    nav.current?.querySelector('a.active')?.scrollIntoView?.({ inline: 'center', block: 'nearest' });
  }, [pathname]);

  return (
    <div className="shell">
      <div className="cabecera">
        <header className="topbar">
          <strong className="marca">Mesa Abierta</strong>
          <Link to="/cuenta" className="cuenta-enlace" aria-label={`Mi cuenta: ${usuario.nombre}, ${usuario.rol}`}>
            <Icono nombre="cuenta" tamano={20} />
            <span>{usuario.nombre}</span>
          </Link>
          <button type="button" className="btn-link" onClick={letra.siguiente}
                  aria-label={`Cambiar tamaño de letra (ahora: ${letra.tamano})`}>
            Aa
          </button>
          <button type="button" className="btn-link" onClick={logout}>Salir</button>
        </header>
        <nav className="pestanas" aria-label="Secciones" ref={nav}>
          {visibles.map((s) => (
            <NavLink key={s.to} to={s.to} end={s.fin}>
              <Icono nombre={s.icono} />
              <span>{s.texto}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <main className="contenido">
        <Outlet />
      </main>
    </div>
  );
}
