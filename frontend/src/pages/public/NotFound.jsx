import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="text-center py-5">
      <h1>Página no encontrada</h1>
      <p className="text-secondary">La dirección no existe.</p>
      <Link to="/" className="btn btn-primary">Volver al inicio</Link>
    </div>
  )
}

export default NotFound
