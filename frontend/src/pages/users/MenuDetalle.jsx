import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Table } from 'react-bootstrap'
import axios from 'axios'
import useAuthStore from '../../store/useAuthStore'
import { BASE_URL, conToken } from '../../services/Api'
import { mensajeError } from '../../utils/errores'
import { cantidad, fechaLarga } from '../../utils/formato'
import Encabezado from '../../components/Encabezado'

const MenuDetalle = () => {
  const { id } = useParams()
  const { user } = useAuthStore()
  const [menu, setMenu] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    axios
      .get(`${BASE_URL}/menus/${id}`, conToken(user))
      .then((response) => setMenu(response.data))
      .catch((err) => setError(mensajeError(err)))
  }, [id])

  if (error) return <p className="alert alert-danger">{error}</p>
  if (!menu) return <p>Cargando...</p>

  return (
    <>
      <Encabezado
        titulo={menu.nombre_plato}
        descripcion={`${fechaLarga(menu.fecha)} · ${menu.servicio} · ${menu.raciones_planificadas} raciones · ${menu.estado === 'confirmado' ? 'Confirmado' : 'Planificado'}`}
        volver={{ to: '/semana', texto: 'Volver a la semana' }}
      />
      <Table hover responsive>
        <thead>
          <tr>
            <th>Ingrediente</th>
            <th className="text-end">Por ración</th>
            <th className="text-end">Total</th>
          </tr>
        </thead>
        <tbody>
          {menu.insumos.map((i) => (
            <tr key={i.producto_id}>
              <td>{i.nombre}</td>
              <td className="text-end">{cantidad(i.cantidad_por_racion, i.unidad)}</td>
              <td className="text-end">{cantidad(i.cantidad_total, i.unidad)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {menu.insumos.length === 0 && <p className="text-secondary">No tiene ingredientes cargados.</p>}
    </>
  )
}

export default MenuDetalle
