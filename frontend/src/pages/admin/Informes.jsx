import { useState, useEffect } from 'react'
import { Table, Form, Row, Col } from 'react-bootstrap'
import axios from 'axios'
import useAuthStore from '../../store/useAuthStore'
import { BASE_URL, conToken } from '../../services/Api'
import { mensajeError } from '../../utils/errores'
import { hoy, inicioDeMes } from '../../utils/formato'
import Encabezado from '../../components/Encabezado'
import { GraficoRaciones, GraficoPlanVsServido, GraficoDonaciones, GraficoDespensa } from '../../components/Graficos'

// Gráficos y totales
const Informes = () => {
  const { user } = useAuthStore()
  const [desde, setDesde] = useState(inicioDeMes(hoy()))
  const [hasta, setHasta] = useState(hoy())
  const [raciones, setRaciones] = useState([])
  const [consumo, setConsumo] = useState([])
  const [donaciones, setDonaciones] = useState([])
  const [tablero, setTablero] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getInformes = async () => {
    setError('')
    if (desde > hasta) {
      setError('"Desde" no puede ser posterior a "Hasta".')
      return
    }
    try {
      const periodo = `desde=${desde}&hasta=${hasta}`
      const respTablero = await axios.get(`${BASE_URL}/reportes/tablero?${periodo}`, conToken(user))
      setTablero(respTablero.data)
      const respRaciones = await axios.get(`${BASE_URL}/reportes/raciones?${periodo}`, conToken(user))
      setRaciones(respRaciones.data)
      const respConsumo = await axios.get(`${BASE_URL}/reportes/consumo-insumos?${periodo}`, conToken(user))
      setConsumo(respConsumo.data)
      const respDonaciones = await axios.get(`${BASE_URL}/reportes/donaciones?${periodo}`, conToken(user))
      setDonaciones(respDonaciones.data)
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getInformes()
  }, [desde, hasta])

  const totalRaciones = raciones.reduce((total, r) => total + Number(r.total_raciones), 0)

  return (
    <>
      <Encabezado titulo="Informes" descripcion="Gráficos y totales del período. No incluyen datos de personas." />
      <Row className="g-2 mb-3">
        <Col xs={6} md={6}>
          <Form.Label htmlFor="desde">Desde</Form.Label>
          <Form.Control id="desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </Col>
        <Col xs={6} md={6}>
          <Form.Label htmlFor="hasta">Hasta</Form.Label>
          <Form.Control id="hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </Col>
      </Row>
      {error && <p className="alert alert-danger">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          {tablero && (
            <Row className="g-3 mb-4">
              <Col lg={6}><GraficoRaciones datos={tablero.racionesPorDia} /></Col>
              <Col lg={6}><GraficoPlanVsServido datos={tablero.planificadasVsServidas} /></Col>
              <Col lg={6}><GraficoDonaciones datos={tablero.donacionesPorOrigen} /></Col>
              <Col lg={6}><GraficoDespensa datos={tablero.despensaPorCategoria} /></Col>
            </Row>
          )}
          <h2 className="h5">Raciones servidas</h2>
          <Table hover responsive>
            <thead>
              <tr><th>Servicio</th><th className="text-end">Raciones</th><th className="text-end">Días con registro</th></tr>
            </thead>
            <tbody>
              {raciones.map((r) => (
                <tr key={r.servicio}>
                  <td>{r.servicio}</td>
                  <td className="text-end">{r.total_raciones}</td>
                  <td className="text-end">{r.dias_registrados}</td>
                </tr>
              ))}
              <tr className="fw-bold"><td>Total</td><td className="text-end">{totalRaciones}</td><td /></tr>
            </tbody>
          </Table>

          <h2 className="h5">Consumo de insumos</h2>
          <Table hover responsive>
            <thead>
              <tr><th>Producto</th><th>Unidad</th><th className="text-end">Cantidad usada</th></tr>
            </thead>
            <tbody>
              {consumo.map((c) => (
                <tr key={c.nombre}>
                  <td>{c.nombre}</td>
                  <td>{c.unidad}</td>
                  <td className="text-end">{Number(c.total_consumido)}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <h2 className="h5">Donaciones recibidas</h2>
          <Table hover responsive>
            <thead>
              <tr><th>Origen</th><th>Producto</th><th>Unidad</th><th className="text-end">Cantidad</th></tr>
            </thead>
            <tbody>
              {donaciones.map((d) => (
                <tr key={`${d.origen}-${d.producto}`}>
                  <td>{d.origen}</td>
                  <td>{d.producto}</td>
                  <td>{d.unidad}</td>
                  <td className="text-end">{Number(d.cantidad_total)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </>
  )
}

export default Informes
