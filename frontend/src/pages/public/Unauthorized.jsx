import { Link } from 'react-router-dom'

const Unauthorized = () => {
  return (
    <div className="text-center py-5">
      <h1>Sin permiso</h1>
      <p className="text-secondary">Tu rol no tiene acceso a esta sección.</p>
      <Link to="/" className="btn btn-primary">Volver al inicio</Link>
    </div>
  )
}

export default Unauthorized
