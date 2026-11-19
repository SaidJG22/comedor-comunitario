import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { GESTION } from '../../auth/roles.js';
import { useSesion } from '../../store/sesion.js';

/** Semana */
export default function SemanaLayout() {
  const { usuario } = useSesion();
  const gestion = GESTION.includes(usuario.rol);
  const enEquipo = useLocation().pathname.startsWith('/semana/equipo');

  return (
    <section>
      <h1>Semana</h1>
      <p className="sub">{gestion ? 'Menús de cada día y el equipo de voluntarios.' : 'Qué se cocina y quién ayuda cada día.'}</p>
      {gestion && (
        <div className="subpestanas" role="tablist" aria-label="Semana">
          <NavLink to="/semana" end role="tab" className={() => (enEquipo ? '' : 'active')}>Menús</NavLink>
          <NavLink to="/semana/equipo" role="tab">Equipo</NavLink>
        </div>
      )}
      <Outlet />
    </section>
  );
}
