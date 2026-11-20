import { useState, useEffect } from 'react'
import { Card, Form, Button } from 'react-bootstrap'
import { FiTrash2 } from 'react-icons/fi'
import axios from 'axios'
import useAuthStore from '../../store/useAuthStore'
import { BASE_URL, conToken } from '../../services/Api'
import { mensajeError } from '../../utils/errores'
import { hoy } from '../../utils/formato'
import Encabezado from '../../components/Encabezado'

const Raciones = () => {
  const { user } = useAuthStore()
  const gestion = user.rol === 'Administrador' || user.rol === 'Responsable'
  const [fecha, setFecha] = useState(hoy())
  const [servicio, setServicio] = useState('almuerzo')
  const [cantidad, setCantidad] = useState(0)
  const [registros, setRegistros] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const getRegistros = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/raciones?desde=${fecha}&hasta=${fecha}`, conToken(user))
      setRegistros(response.data)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  useEffect(() => {
    if (fecha && fecha <= hoy()) getRegistros()
  }, [fecha])

  // Cantidad ya cargada
  const registro = registros.find((r) => r.servicio === servicio)
  useEffect(() => {
    setCantidad(registro ? registro.cantidad : 0)
  }, [registros, servicio])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensaje('')
    setError('')
    setSaving(true)
    try {
      await axios.put(`${BASE_URL}/raciones`, { fecha, servicio, cantidad: Number(cantidad) }, conToken(user))
      setMensaje(`Se guardaron ${cantidad} raciones de ${servicio}.`)
      getRegistros()
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`¿Borrar el registro de ${servicio} de ese día?`)) return
    try {
      await axios.delete(`${BASE_URL}/raciones/${registro.id}`, conToken(user))
      setMensaje('Se borró el registro.')
      getRegistros()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div className="formulario">
      <Encabezado titulo="Raciones servidas" descripcion="Solo se anota la cantidad, sin datos de las personas." />
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="fecha">
              <Form.Label>Día</Form.Label>
              <Form.Control type="date" max={hoy()} required value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="servicio">
              <Form.Label>Servicio</Form.Label>
              <Form.Select value={servicio} onChange={(e) => setServicio(e.target.value)}>
                <option value="almuerzo">Almuerzo</option>
                <option value="merienda">Merienda</option>
              </Form.Select>
            </Form.Group>
            <Form.Label htmlFor="cantidad">Cantidad de raciones</Form.Label>
            <div className="d-flex gap-2 mb-3 contador">
              <Button variant="outline-secondary" aria-label="Restar 1" onClick={() => setCantidad(Math.max(0, Number(cantidad) - 1))}>−</Button>
              <Form.Control id="cantidad" type="number" min="0" max="5000" className="text-center" value={cantidad}
                onChange={(e) => setCantidad(e.target.value)} />
              <Button variant="outline-secondary" aria-label="Sumar 1" onClick={() => setCantidad(Number(cantidad) + 1)}>+</Button>
            </div>
            {mensaje && <p className="alert alert-success">{mensaje}</p>}
            {error && <p className="alert alert-danger">{error}</p>}
            <Button type="submit" size="lg" className="w-100" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </Form>
          {gestion && registro && (
            <Button variant="outline-danger" className="w-100 mt-3" onClick={handleDelete}>
              <FiTrash2 /> Borrar este registro
            </Button>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default Raciones
