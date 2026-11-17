/** Campo de formulario con etiqueta asociada (accesible para lectores de pantalla). */
export function Campo({ label, ayuda, children }) {
  return (
    <label className="campo">
      <span>{label}</span>
      {children}
      {ayuda && <small className="ayuda">{ayuda}</small>}
    </label>
  );
}

export function Entrada({ label, ayuda, ...props }) {
  return (
    <Campo label={label} ayuda={ayuda}>
      <input {...props} />
    </Campo>
  );
}

export function Lista({ label, ayuda, opciones, vacio = 'Elegir…', ...props }) {
  return (
    <Campo label={label} ayuda={ayuda}>
      <select {...props}>
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

/** Mensajes de error (aviso inmediato) y de éxito (aviso cortés) para lectores de pantalla. */
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

export const Vacio = ({ children }) => <p className="estado vacio">{children}</p>;
