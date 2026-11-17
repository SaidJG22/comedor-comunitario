import { NavLink, Outlet } from 'react-router-dom';

/** Despensa = stock de alimentos e insumos: existencias y donaciones en un mismo lugar. */
export default function DespensaPage() {
  return (
    <section>
      <h1>Despensa</h1>
      <p className="sub">Stock de alimentos e insumos.</p>
      <div className="subpestanas" role="tablist" aria-label="Despensa">
        <NavLink to="existencias" role="tab">Lo que hay</NavLink>
        <NavLink to="donaciones" role="tab">Donaciones</NavLink>
      </div>
      <Outlet />
    </section>
  );
}
