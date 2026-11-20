import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Form, Button, Row, Col } from 'react-bootstrap'
import { FiPlus, FiX } from 'react-icons/fi'
import axios from 'axios'
import useAuthStore from '../../store/useAuthStore'
import { BASE_URL, conToken } from '../../services/Api'
import { mensajeError } from '../../utils/errores'
import { hoy } from '../../utils/formato'
import Encabezado from '../../components/Encabezado'

const MenuForm = () => {
  const { id } = useParams()
  const editando = Boolean(id)
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const insumoVacio = { productoId: '', total: '' }
  const [form, setForm] = useState({ fecha: hoy(), servicio: 'almuerzo', nombrePlato: '', raciones: '' })
  const [insumos, setInsumos] = useState([insumoVacio])
  const [productos, setProductos] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      try {
        const respProductos = await axios.get(`${BASE_URL}/stock/productos`, conToken(user))
        setProductos(respProductos.data)
        if (editando) {
          const response = await axios.get(`${BASE_URL}/menus/${id}`, conToken(user))
          const m = response.data
          if (m.estado === 'confirmado') {
            setError('Este menú ya está confirmado y no se puede editar.')
          }
          setForm({ fecha: m.fecha, servicio: m.servicio, nombrePlato: m.nombre_plato, raciones: m.raciones_planificadas })
          if (m.insumos.length > 0) {
            setInsumos(m.insumos.map((i) => ({ productoId: i.producto_id, total: Number(i.cantidad_total) })))
          }
        }
      } catch (err) {
        setError(mensajeError(err))
      }
    }
    cargar()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const cambiarInsumo = (index, campo, valor) => {
    setInsumos(insumos.map((insumo, i) => (i === index ? { ...insumo, [campo]: valor } : insumo)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const raciones = Number(form.raciones)
    const menu = {
      fecha: form.fecha,
      servicio: form.servicio,
      nombrePlato: form.nombrePlato,
      racionesPlanificadas: raciones,
      // Total por ración
      insumos: insumos
        .filter((i) => i.productoId && i.total)
        .map((i) => ({ productoId: Number(i.productoId), cantidadPorRacion: Number(i.total) / raciones })),
    }
    try {
      if (editando) {
        await axios.put(`${BASE_URL}/menus/${id}`, menu, conToken(user))
      } else {
        await axios.post(`${BASE_URL}/menus`, menu, conToken(user))
      }
      navigate('/semana')
    } catch (err) {
      setError(err.response?.status === 409 && !editando ? 'Ya hay un menú para ese día y servicio.' : mensajeError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="formulario">
      <Encabezado titulo={editando ? 'Editar menú' : 'Planificar menú'} />
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-2 mb-3">
              <Col md={6}>
                <Form.Label htmlFor="fecha">Día</Form.Label>
                <Form.Control id="fecha" name="fecha" type="date" required value={form.fecha} onChange={handleChange} />
              </Col>
              <Col md={6}>
                <Form.Label htmlFor="servicio">Servicio</Form.Label>
                <Form.Select id="servicio" name="servicio" value={form.servicio} onChange={handleChange}>
                  <option value="almuerzo">Almuerzo</option>
                  <option value="merienda">Merienda</option>
                </Form.Select>
              </Col>
            </Row>
            <Form.Group className="mb-3" controlId="nombrePlato">
              <Form.Label>¿Qué se cocina?</Form.Label>
              <Form.Control name="nombrePlato" required maxLength={100} value={form.nombrePlato} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="raciones">
              <Form.Label>¿Para cuántas raciones?</Form.Label>
              <Form.Control name="raciones" type="number" min="1" max="5000" required value={form.raciones} onChange={handleChange} />
            </Form.Group>

            <h2 className="h5">Ingredientes (cantidad total para todas las raciones)</h2>
            {insumos.map((insumo, index) => (
              <Row className="g-2 mb-2 align-items-end" key={index}>
                <Col md={7}>
                  <Form.Label htmlFor={`producto-${index}`}>Producto</Form.Label>
                  <Form.Select id={`producto-${index}`} value={insumo.productoId} onChange={(e) => cambiarInsumo(index, 'productoId', e.target.value)}>
                    <option value="">Elegí...</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre} ({p.unidad})</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={9} md={4}>
                  <Form.Label htmlFor={`total-${index}`}>Cantidad total</Form.Label>
                  <Form.Control id={`total-${index}`} type="number" min="0.01" step="any" value={insumo.total}
                    onChange={(e) => cambiarInsumo(index, 'total', e.target.value)} />
                </Col>
                <Col xs={3} md={1}>
                  {insumos.length > 1 && (
                    <Button variant="outline-danger" aria-label="Quitar ingrediente" onClick={() => setInsumos(insumos.filter((_, i) => i !== index))}>
                      <FiX />
                    </Button>
                  )}
                </Col>
              </Row>
            ))}
            <Button variant="outline-secondary" className="mb-3" onClick={() => setInsumos([...insumos, insumoVacio])}>
              <FiPlus /> Agregar ingrediente
            </Button>

            {error && <p className="alert alert-danger">{error}</p>}
            <div className="formulario-pie">
              <Button variant="outline-secondary" onClick={() => navigate('/semana')}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar menú'}</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default MenuForm
