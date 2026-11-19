import { NavLink, Outlet, useLocation } from 'react-router-dom';

/** Despensa */
export default function DespensaLayout() {
  const { pathname } = useLocation();
  const enCategorias = pathname.startsWith('/despensa/categorias');
  return (
    <section>
      <h1>Despensa</h1>
      <p className="sub">Stock de alimentos e insumos.</p>
      <div className="subpestanas" role="tablist" aria-label="Despensa">
        <NavLink to="existencias" role="tab" className={({ isActive }) => (isActive || enCategorias ? 'active' : '')}>Lo que hay</NavLink>
        <NavLink to="donaciones" role="tab">Donaciones</NavLink>
      </div>
      <Outlet />
    </section>
  );
}
