import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Row, Col } from 'react-bootstrap'
import axios from 'axios'
import useAuthStore from '../../store/useAuthStore'
import { BASE_URL, conToken } from '../../services/Api'
import { mensajeError } from '../../utils/errores'
import { fechaLarga, hoy, inicioDeMes } from '../../utils/formato'
import { GraficoRaciones } from '../../components/Graficos'

// Dashboard
const Home = () => {
  const { user } = useAuthStore()
  const gestion = user.rol === 'Administrador' || user.rol === 'Responsable'
  const fecha = hoy()
  const [menus, setMenus] = useState([])
  const [raciones, setRaciones] = useState([])
  const [turnos, setTurnos] = useState([])
  const [kpis, setKpis] = useState(null)
  const [racionesPorDia, setRacionesPorDia] = useState([])
  const [error, setError] = useState('')

  const getResumen = async () => {
    try {
      const dia = `desde=${fecha}&hasta=${fecha}`
      const respMenus = await axios.get(`${BASE_URL}/menus?${dia}`, conToken(user))
      setMenus(respMenus.data)
      const respRaciones = await axios.get(`${BASE_URL}/raciones?${dia}`, conToken(user))
      setRaciones(respRaciones.data)
      const respTurnos = await axios.get(`${BASE_URL}/voluntarios/turnos?${dia}`, conToken(user))
      setTurnos(respTurnos.data)
      if (gestion) {
        const respTablero = await axios.get(`${BASE_URL}/reportes/tablero?desde=${inicioDeMes(fecha)}&hasta=${fecha}`, conToken(user))
        setKpis(respTablero.data.kpis)
        setRacionesPorDia(respTablero.data.racionesPorDia)
      }
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  useEffect(() => {
    getResumen()
  }, [])

  const servicios = ['almuerzo', 'merienda']
  const nombres = (servicio, tarea) =>
    turnos.filter((t) => t.servicio === servicio && t.tarea === tarea).map((t) => t.voluntario).join(', ') || 'sin asignar'

  return (
    <>
      <div className="bienvenida mb-4">
        <h1 className="h3">Hola, {user.nombre}</h1>
        <p className="mb-0">{fechaLarga(fecha)}</p>
      </div>
      {error && <p className="alert alert-danger">{error}</p>}

      {gestion && kpis && (
        <>
          <h2 className="h5">Este mes</h2>
          <Row className="g-3 mb-4">
            <Col xs={6} lg={3}>
              <Card className="h-100"><Card.Body>
                <Card.Text className="text-secondary mb-1">Raciones servidas</Card.Text>
                <Card.Title as="p" className="fs-3 fw-bold">{kpis.raciones}</Card.Title>
              </Card.Body></Card>
            </Col>
            <Col xs={6} lg={3}>
              <Card className="h-100"><Card.Body>
                <Card.Text className="text-secondary mb-1">Promedio por día</Card.Text>
                <Card.Title as="p" className="fs-3 fw-bold">{kpis.promedioDiario}</Card.Title>
              </Card.Body></Card>
            </Col>
            <Col xs={6} lg={3}>
              <Card className="h-100"><Card.Body>
                <Card.Text className="text-secondary mb-1">Donaciones</Card.Text>
                <Card.Title as="p" className="fs-3 fw-bold">{kpis.donaciones}</Card.Title>
              </Card.Body></Card>
            </Col>
            <Col xs={6} lg={3}>
              <Card as={Link} to="/productos" className="h-100 text-decoration-none"><Card.Body>
                <Card.Text className="text-secondary mb-1">Alertas de despensa</Card.Text>
                <Card.Title as="p" className="fs-3 fw-bold">{kpis.stockBajo + kpis.porVencer}</Card.Title>
              </Card.Body></Card>
            </Col>
          </Row>
        </>
      )}

      <h2 className="h5">Hoy</h2>
      <Row className="g-3">
        {servicios.map((servicio) => {
          const menu = menus.find((m) => m.servicio === servicio)
          const registro = raciones.find((r) => r.servicio === servicio)
          return (
            <Col lg={6} key={servicio}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title className="text-capitalize">{servicio}</Card.Title>
                  <p className="mb-1"><strong>Menú:</strong> {menu ? `${menu.nombre_plato} (${menu.raciones_planificadas} raciones)` : 'sin planificar'}</p>
                  <p className="mb-1"><strong>Cocina:</strong> {nombres(servicio, 'cocina')}</p>
                  <p className="mb-1"><strong>Servicio:</strong> {nombres(servicio, 'servicio')}</p>
                  <p><strong>Raciones servidas:</strong> {registro ? registro.cantidad : 'todavía sin cargar'}</p>
                  <Link to="/raciones" className="btn btn-primary">Cargar raciones</Link>
                </Card.Body>
              </Card>
            </Col>
          )
        })}
      </Row>

      {gestion && kpis && (
        <div className="mt-4">
          <GraficoRaciones datos={racionesPorDia} titulo="Raciones de este mes" />
        </div>
      )}
    </>
  )
}

export default Home
