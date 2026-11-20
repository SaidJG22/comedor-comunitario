import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Table } from 'react-bootstrap'
import axios from 'axios'
import useAuthStore from '../../store/useAuthStore'
import { BASE_URL, conToken } from '../../services/Api'
import { mensajeError } from '../../utils/errores'
import { cantidad, fechaCorta, fechaLarga } from '../../utils/formato'
import Encabezado from '../../components/Encabezado'

const DonacionDetalle = () => {
  const { id } = useParams()
  const { user } = useAuthStore()
  const [donacion, setDonacion] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    axios
      .get(`${BASE_URL}/donaciones/${id}`, conToken(user))
      .then((response) => setDonacion(response.data))
      .catch((err) => setError(mensajeError(err)))
  }, [id])

  if (error) return <p className="alert alert-danger">{error}</p>
  if (!donacion) return <p>Cargando...</p>

  return (
    <>
      <Encabezado
        titulo={`Donación de ${donacion.origen}`}
        descripcion={`${fechaLarga(donacion.fecha)}${donacion.referencia ? ` · ${donacion.referencia}` : ''}`}
        volver={{ to: '/donaciones', texto: 'Volver a donaciones' }}
      >
        <Link to={`/donaciones/${id}/editar`} className="btn btn-outline-secondary">Editar</Link>
      </Encabezado>
      <Table hover responsive>
        <thead>
          <tr>
            <th>Producto</th>
            <th className="text-end">Llegó</th>
            <th>Vence</th>
            <th className="text-end">Ya se usó</th>
          </tr>
        </thead>
        <tbody>
          {donacion.items.map((i) => (
            <tr key={i.id}>
              <td>{i.nombre}</td>
              <td className="text-end">{cantidad(i.cantidad, i.unidad)}</td>
              <td>{i.fecha_vencimiento ? fechaCorta(i.fecha_vencimiento) : '-'}</td>
              <td className="text-end">{Number(i.usado) > 0 ? cantidad(i.usado, i.unidad) : '-'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}

export default DonacionDetalle
