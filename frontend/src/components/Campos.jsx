import Icono from './Iconos.jsx';

/** Campo */
function Campo({ label, ayuda, children }) {
  return (
    <label className="campo">
      <span className="form-label">{label}</span>
      {children}
      {ayuda && <small className="form-text ayuda">{ayuda}</small>}
    </label>
  );
}

export function Entrada({ label, ayuda, ...props }) {
  return (
    <Campo label={label} ayuda={ayuda}>
      <input className="form-control" {...props} />
    </Campo>
  );
}

export function Lista({ label, ayuda, opciones, vacio = 'Elegir…', ...props }) {
  return (
    <Campo label={label} ayuda={ayuda}>
      <select className="form-select" {...props}>
        <option value="">{vacio}</option>
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
    </Campo>
  );
}

/** Mensajes */
export function Mensajes({ error, ok }) {
  return (
    <>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {ok && (
        <p role="status" className="ok">
          {ok}
        </p>
      )}
    </>
  );
}

export const Cargando = ({ texto = 'Cargando…' }) => (
  <p className="estado" aria-live="polite">
    {texto}
  </p>
);

/** Estado vacío */
export function Vacio({ children, icono, accion }) {
  return (
    <div className="vacio">
      {icono && <span className="vacio-icono"><Icono nombre={icono} /></span>}
      <p>{children}</p>
      {accion && (
        <button type="button" className="btn btn-outline-secondary" onClick={accion.onClick}>
          <Icono nombre={accion.icono ?? 'mas'} tamano={20} />
          {accion.texto}
        </button>
      )}
    </div>
  );
}
