import Icono from './Iconos.jsx';

/** Acciones de la fila */
export default function AccionesFila({ acciones }) {
  return (
    <div className="acciones-fila">
      {acciones.filter(Boolean).map((a) => (
        <button key={a.texto} type="button"
                className={`btn btn-sm mini ${a.peligro ? 'btn-outline-danger' : a.primario ? 'btn-primary' : 'btn-outline-secondary'}`}
                aria-label={a.etiqueta} onClick={a.onClick} disabled={a.deshabilitado}>
          <Icono nombre={a.icono} tamano={18} />
          {a.texto}
        </button>
      ))}
    </div>
  );
}
