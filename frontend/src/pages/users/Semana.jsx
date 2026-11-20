import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Button, Row, Col, Form } from 'react-bootstrap'
import { FiChevronLeft, FiChevronRight, FiPlus, FiCheck, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import axios from 'axios'
import useAuthStore from '../../store/useAuthStore'
import { BASE_URL, conToken } from '../../services/Api'
import { mensajeError } from '../../utils/errores'
import { diasDeLaSemana, fechaCorta, fechaLarga, hoy, lunesDe, sumarDias } from '../../utils/formato'
import Encabezado from '../../components/Encabezado'

const Semana = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const gestion = user.rol === 'Administrador' || user.rol === 'Responsable'
  const [lunes, setLunes] = useState(lunesDe(hoy()))
  const [dia, setDia] = useState(hoy())
  const [menus, setMenus] = useState([])
  const [turnos, setTurnos] = useState([])
  const [voluntarios, setVoluntarios] = useState([])
  const [nuevoTurno, setNuevoTurno] = useState({ servicio: 'almuerzo', tarea: 'cocina', voluntarioId: '' })
  const [error, setError] = useState('')
  const dias = diasDeLaSemana(lunes)

  const getSemana = async () => {
    setError('')
    try {
      const rango = `desde=${dias[0]}&hasta=${dias[6]}`
      const respMenus = await axios.get(`${BASE_URL}/menus?${rango}`, conToken(user))
      setMenus(respMenus.data)
      const respTurnos = await axios.get(`${BASE_URL}/voluntarios/turnos?${rango}`, conToken(user))
      setTurnos(respTurnos.data)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  useEffect(() => {
    getSemana()
  }, [lunes])

  useEffect(() => {
    if (!gestion) return
    axios
      .get(`${BASE_URL}/voluntarios`, conToken(user))
      .then((response) => setVoluntarios(response.data))
      .catch((err) => setError(mensajeError(err)))
  }, [])

  const cambiarSemana = (cantidadDias) => {
    const nuevoLunes = sumarDias(lunes, cantidadDias)
    setLunes(nuevoLunes)
    setDia(nuevoLunes)
  }

  const confirmar = async (menu) => {
    if (!window.confirm(`¿Confirmar "${menu.nombre_plato}"? Se descuentan los ingredientes de la despensa y ya no se puede editar.`)) return
    try {
      await axios.post(`${BASE_URL}/menus/${menu.id}/confirmar`, {}, conToken(user))
      getSemana()
    } catch (err) {
      alert(mensajeError(err))
    }
  }

  const borrarMenu = async (menu) => {
    if (!window.confirm(`¿Borrar el menú "${menu.nombre_plato}"?`)) return
    try {
      await axios.delete(`${BASE_URL}/menus/${menu.id}`, conToken(user))
      getSemana()
    } catch (err) {
      alert(mensajeError(err))
    }
  }

  const asignar = async (e) => {
    e.preventDefault()
    try {
      await axios.post(
        `${BASE_URL}/voluntarios/turnos`,
        { fecha: dia, servicio: nuevoTurno.servicio, tarea: nuevoTurno.tarea, voluntarioId: Number(nuevoTurno.voluntarioId) },
        conToken(user),
      )
      setNuevoTurno({ ...nuevoTurno, voluntarioId: '' })
      getSemana()
    } catch (err) {
      alert(err.response?.status === 409 ? 'Esa persona ya está en ese turno.' : mensajeError(err))
    }
  }

  const quitarTurno = async (turno) => {
    if (!window.confirm(`¿Quitar a ${turno.voluntario} del turno?`)) return
    try {
      await axios.delete(`${BASE_URL}/voluntarios/turnos/${turno.id}`, conToken(user))
      getSemana()
    } catch (err) {
      alert(mensajeError(err))
    }
  }

  return (
    <>
      <Encabezado titulo="Menús de la semana">
        {gestion && <Button onClick={() => navigate('/semana/menus/nuevo')}><FiPlus /> Planificar menú</Button>}
      </Encabezado>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <Button variant="outline-secondary" aria-label="Semana anterior" onClick={() => cambiarSemana(-7)}><FiChevronLeft /></Button>
        <strong>Semana del {fechaCorta(dias[0])} al {fechaCorta(dias[6])}</strong>
        <Button variant="outline-secondary" aria-label="Semana siguiente" onClick={() => cambiarSemana(7)}><FiChevronRight /></Button>
      </div>
      <div className="dias mb-3">
        {dias.map((d) => (
          <Button key={d} variant={d === dia ? 'primary' : 'outline-secondary'} onClick={() => setDia(d)}>
            {fechaLarga(d).slice(0, 3).toLowerCase()} {Number(d.slice(8))}
          </Button>
        ))}
      </div>

      {error && <p className="alert alert-danger">{error}</p>}
      <h2 className="h5">{fechaLarga(dia)}</h2>
      <Row className="g-3 mb-4">
        {['almuerzo', 'merienda'].map((servicio) => {
          const menu = menus.find((m) => m.fecha === dia && m.servicio === servicio)
          const delServicio = turnos.filter((t) => t.fecha === dia && t.servicio === servicio)
          return (
            <Col lg={6} key={servicio}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title className="text-capitalize">{servicio}</Card.Title>
                  {menu ? (
                    <>
                      <p className="fs-5 mb-1">{menu.nombre_plato}</p>
                      <p className="text-secondary">
                        {menu.raciones_planificadas} raciones · {menu.estado === 'confirmado' ? 'Confirmado' : 'Planificado'}
                      </p>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        {gestion && menu.estado === 'planificado' && (
                          <>
                            <Button size="sm" onClick={() => confirmar(menu)}><FiCheck /> Confirmar</Button>
                            <Button size="sm" variant="outline-secondary" onClick={() => navigate(`/semana/menus/${menu.id}/editar`)}><FiEdit2 /> Editar</Button>
                            <Button size="sm" variant="outline-danger" onClick={() => borrarMenu(menu)}><FiTrash2 /> Borrar</Button>
                          </>
                        )}
                        <Link to={`/semana/menus/${menu.id}`} className="btn btn-link btn-sm">Ver ingredientes</Link>
                      </div>
                    </>
                  ) : (
                    <p className="text-secondary">Sin menú planificado.</p>
                  )}
                  <hr />
                  {['cocina', 'servicio'].map((tarea) => (
                    <p key={tarea} className="mb-1">
                      <strong className="text-capitalize">{tarea}:</strong>{' '}
                      {delServicio.filter((t) => t.tarea === tarea).length === 0 && <span className="text-secondary">sin asignar</span>}
                      {delServicio.filter((t) => t.tarea === tarea).map((t) => (
                        <span key={t.id} className="turno">
                          {t.voluntario}
                          {gestion && (
                            <Button variant="link" size="sm" className="text-danger p-0 ms-1" aria-label={`Quitar a ${t.voluntario}`} onClick={() => quitarTurno(t)}>
                              <FiX />
                            </Button>
                          )}
                        </span>
                      ))}
                    </p>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          )
        })}
      </Row>

      {gestion && (
        <Card>
          <Card.Body>
            <Card.Title as="h2" className="h5">Asignar un turno para este día</Card.Title>
            <Form onSubmit={asignar}>
              <Row className="g-2 align-items-end">
                <Col md={3}>
                  <Form.Label htmlFor="turno-servicio">Servicio</Form.Label>
                  <Form.Select id="turno-servicio" value={nuevoTurno.servicio} onChange={(e) => setNuevoTurno({ ...nuevoTurno, servicio: e.target.value })}>
                    <option value="almuerzo">Almuerzo</option>
                    <option value="merienda">Merienda</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Label htmlFor="turno-tarea">Tarea</Form.Label>
                  <Form.Select id="turno-tarea" value={nuevoTurno.tarea} onChange={(e) => setNuevoTurno({ ...nuevoTurno, tarea: e.target.value })}>
                    <option value="cocina">Cocina</option>
                    <option value="servicio">Servicio</option>
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label htmlFor="turno-voluntario">Voluntario</Form.Label>
                  <Form.Select id="turno-voluntario" required value={nuevoTurno.voluntarioId} onChange={(e) => setNuevoTurno({ ...nuevoTurno, voluntarioId: e.target.value })}>
                    <option value="">Elegí...</option>
                    {voluntarios.map((v) => (
                      <option key={v.id} value={v.id}>{v.nombre_visible}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Button type="submit" className="w-100">Asignar</Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      )}
    </>
  )
}

export default Semana
