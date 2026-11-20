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

const DonacionForm = () => {
  const { id } = useParams()
  const editando = Boolean(id)
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const itemVacio = { productoId: '', cantidad: '', fechaVencimiento: '' }
  const [form, setForm] = useState({ origenId: '', referencia: '', fecha: hoy() })
  const [items, setItems] = useState([itemVacio])
  const [origenes, setOrigenes] = useState([])
  const [productos, setProductos] = useState([])
  const [usada, setUsada] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      try {
        const respOrigenes = await axios.get(`${BASE_URL}/donaciones/origenes`, conToken(user))
        setOrigenes(respOrigenes.data)
        const respProductos = await axios.get(`${BASE_URL}/stock/productos`, conToken(user))
        setProductos(respProductos.data)
        if (editando) {
          const response = await axios.get(`${BASE_URL}/donaciones/${id}`, conToken(user))
          const d = response.data
          setForm({ origenId: d.origen_id, referencia: d.referencia || '', fecha: d.fecha })
          setItems(d.items.map((i) => ({ productoId: i.producto_id, cantidad: Number(i.cantidad), fechaVencimiento: i.fecha_vencimiento || '' })))
          setUsada(d.items.some((i) => Number(i.usado) > 0))
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

  const cambiarItem = (index, campo, valor) => {
    setItems(items.map((item, i) => (i === index ? { ...item, [campo]: valor } : item)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const donacion = {
      origenId: Number(form.origenId),
      referencia: form.referencia || undefined,
      fecha: form.fecha,
      items: items.map((item) => ({
        productoId: Number(item.productoId),
        cantidad: Number(item.cantidad),
        fechaVencimiento: item.fechaVencimiento || undefined,
      })),
    }
    try {
      if (editando) {
        await axios.put(`${BASE_URL}/donaciones/${id}`, donacion, conToken(user))
      } else {
        await axios.post(`${BASE_URL}/donaciones`, donacion, conToken(user))
      }
      navigate('/donaciones')
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="formulario">
      <Encabezado titulo={editando ? 'Editar donación' : 'Registrar donación'} descripcion="Lo que llega se suma solo a la despensa. Si falta un producto, cargalo primero en Productos." />
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="origenId">
              <Form.Label>¿Quién donó?</Form.Label>
              <Form.Select name="origenId" required value={form.origenId} onChange={handleChange}>
                <option value="">Elegí...</option>
                {origenes.map((o) => (
                  <option key={o.id} value={o.id}>{o.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="referencia">
              <Form.Label>Referencia (opcional, sin datos de personas)</Form.Label>
              <Form.Control name="referencia" maxLength={100} value={form.referencia} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="fecha">
              <Form.Label>¿Cuándo llegó?</Form.Label>
              <Form.Control name="fecha" type="date" required max={hoy()} value={form.fecha} onChange={handleChange} />
            </Form.Group>

            {usada ? (
              <p className="alert alert-warning">
                Parte de esta donación ya se usó: solo se pueden corregir el origen, la referencia y la fecha.
              </p>
            ) : (
              <>
                <h2 className="h5">Productos</h2>
                {items.map((item, index) => (
                  <Row className="g-2 mb-2 align-items-end" key={index}>
                    <Col md={5}>
                      <Form.Label htmlFor={`producto-${index}`}>Producto</Form.Label>
                      <Form.Select id={`producto-${index}`} required value={item.productoId} onChange={(e) => cambiarItem(index, 'productoId', e.target.value)}>
                        <option value="">Elegí...</option>
                        {productos.map((p) => (
                          <option key={p.id} value={p.id}>{p.nombre} ({p.unidad})</option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col xs={5} md={3}>
                      <Form.Label htmlFor={`cantidad-${index}`}>Cantidad</Form.Label>
                      <Form.Control id={`cantidad-${index}`} type="number" min="0.01" step="any" required value={item.cantidad}
                        onChange={(e) => cambiarItem(index, 'cantidad', e.target.value)} />
                    </Col>
                    <Col xs={5} md={3}>
                      <Form.Label htmlFor={`vence-${index}`}>Vence</Form.Label>
                      <Form.Control id={`vence-${index}`} type="date" value={item.fechaVencimiento}
                        onChange={(e) => cambiarItem(index, 'fechaVencimiento', e.target.value)} />
                    </Col>
                    <Col xs={2} md={1}>
                      {items.length > 1 && (
                        <Button variant="outline-danger" aria-label="Quitar producto" onClick={() => setItems(items.filter((_, i) => i !== index))}>
                          <FiX />
                        </Button>
                      )}
                    </Col>
                  </Row>
                ))}
                <Button variant="outline-secondary" className="mb-3" onClick={() => setItems([...items, itemVacio])}>
                  <FiPlus /> Agregar otro producto
                </Button>
              </>
            )}

            {error && <p className="alert alert-danger">{error}</p>}
            <div className="formulario-pie">
              <Button variant="outline-secondary" onClick={() => navigate('/donaciones')}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar donación'}</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default DonacionForm
