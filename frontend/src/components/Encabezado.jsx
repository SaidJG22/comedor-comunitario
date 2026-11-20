import { Link } from 'react-router-dom'

// Título de pantalla
const Encabezado = ({ titulo, descripcion, volver, children }) => {
  return (
    <div className="encabezado">
      {volver && <Link to={volver.to} className="encabezado-volver">← {volver.texto}</Link>}
      <div className="encabezado-fila">
        <div>
          <h1 className="h3 mb-1">{titulo}</h1>
          {descripcion && <p className="text-secondary mb-0">{descripcion}</p>}
        </div>
        {children && <div className="encabezado-botones">{children}</div>}
      </div>
    </div>
  )
}

export default Encabezado
