import Icono from './Iconos.jsx';

/** Encabezado de página */
export default function EncabezadoPagina({ titulo, descripcion, accion, nivel = 1 }) {
  const Titulo = nivel === 1 ? 'h1' : 'h2';
  return (
    <div className="encabezado-pagina">
      <div>
        <Titulo>{titulo}</Titulo>
        {descripcion && <p className="sub">{descripcion}</p>}
      </div>
      {accion && (
        <button type="button" className="btn btn-primary" onClick={accion.onClick}>
          <Icono nombre={accion.icono ?? 'mas'} tamano={20} />
          {accion.texto}
        </button>
      )}
    </div>
  );
}
