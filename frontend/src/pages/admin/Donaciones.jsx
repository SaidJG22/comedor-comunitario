import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Table, Button, Form, Row, Col } from 'react-bootstrap'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import axios from 'axios'
import useAuthStore from '../../store/useAuthStore'
import { BASE_URL, conToken } from '../../services/Api'
import { mensajeError } from '../../utils/errores'
import { fechaCorta, hoy, inicioDeMes } from '../../utils/formato'
import Encabezado from '../../components/Encabezado'

const Donaciones = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [donaciones, setDonaciones] = useState([])
  const [desde, setDesde] = useState(inicioDeMes(hoy()))
  const [hasta, setHasta] = useState(hoy())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getDonaciones = async () => {
    setError('')
    try {
      const response = await axios.get(`${BASE_URL}/donaciones?desde=${desde}&hasta=${hasta}`, conToken(user))
      setDonaciones(response.data)
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getDonaciones()
  }, [desde, hasta])

  const handleDelete = async (donacion) => {
    const result = window.confirm(`¿Borrar la donación de ${donacion.origen}? Se resta de la despensa lo que entró.`)
    if (!result) return
    try {
      await axios.delete(`${BASE_URL}/donaciones/${donacion.id}`, conToken(user))
      setDonaciones((prev) => prev.filter((d) => d.id !== donacion.id))
    } catch (err) {
      alert(mensajeError(err))
    }
  }

  return (
    <>
      <Encabezado titulo="Donaciones">
        <Button onClick={() => navigate('/donaciones/nueva')}><FiPlus /> Registrar donación</Button>
      </Encabezado>
      <Row className="g-2 mb-3">
        <Col xs={6}>
          <Form.Label htmlFor="desde">Desde</Form.Label>
          <Form.Control id="desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </Col>
        <Col xs={6}>
          <Form.Label htmlFor="hasta">Hasta</Form.Label>
          <Form.Control id="hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </Col>
      </Row>
      {error && <p className="alert alert-danger">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table hover responsive className="align-middle">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Origen</th>
              <th>Referencia</th>
              <th className="text-end">Productos</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {donaciones.map((d) => (
              <tr key={d.id}>
                <td>{fechaCorta(d.fecha)}</td>
                <td><Link to={`/donaciones/${d.id}`}>{d.origen}</Link></td>
                <td>{d.referencia || '-'}</td>
                <td className="text-end">{d.cantidad_items}</td>
                <td className="text-end text-nowrap">
                  <Button size="sm" variant="outline-secondary" className="me-1" onClick={() => navigate(`/donaciones/${d.id}/editar`)}>
                    <FiEdit2 /> Editar
                  </Button>
                  {Number(d.usada) === 0 && (
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(d)}>
                      <FiTrash2 /> Borrar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {!loading && donaciones.length === 0 && <p className="text-secondary">No hay donaciones en estas fechas.</p>}
    </>
  )
}

export default Donaciones
