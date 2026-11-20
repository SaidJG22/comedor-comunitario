import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Form, Button } from 'react-bootstrap'
import axios from 'axios'
import useAuthStore from '../../store/useAuthStore'
import { BASE_URL, conToken } from '../../services/Api'
import { mensajeError } from '../../utils/errores'
import { cantidad, hoy } from '../../utils/formato'
import Encabezado from '../../components/Encabezado'

// Llegó o se usó
const Movimiento = () => {
  const { id } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [producto, setProducto] = useState(null)
  const [form, setForm] = useState({ tipo: 'ingreso', motivo: 'compra', cantidad: '', fechaVencimiento: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    axios
      .get(`${BASE_URL}/stock/productos/${id}`, conToken(user))
      .then((response) => setProducto(response.data))
      .catch((err) => setError(mensajeError(err)))
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'tipo') {
      setForm({ ...form, tipo: value, motivo: value === 'ingreso' ? 'compra' : 'consumo' })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await axios.post(
        `${BASE_URL}/stock/movimientos`,
        {
          productoId: Number(id),
          tipo: form.tipo,
          motivo: form.motivo,
          cantidad: Number(form.cantidad),
          fecha: hoy(),
          fechaVencimiento: form.tipo === 'ingreso' && form.fechaVencimiento ? form.fechaVencimiento : undefined,
        },
        conToken(user),
      )
      navigate('/productos')
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setSaving(false)
    }
  }

  if (!producto) {
    return error ? <p className="alert alert-danger">{error}</p> : <p>Cargando...</p>
  }

  return (
    <div className="formulario">
      <Encabezado titulo={`Llegó o se usó: ${producto.nombre}`} descripcion={`Ahora hay ${cantidad(producto.stock_actual, producto.unidad)}.`} />
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="tipo">
              <Form.Label>¿Qué pasó?</Form.Label>
              <Form.Select name="tipo" value={form.tipo} onChange={handleChange}>
                <option value="ingreso">Llegó mercadería</option>
                <option value="egreso">Se usó o se descartó</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="motivo">
              <Form.Label>¿Por qué?</Form.Label>
              <Form.Select name="motivo" value={form.motivo} onChange={handleChange}>
                {form.tipo === 'ingreso' ? (
                  <>
                    <option value="compra">La compramos</option>
                    <option value="ajuste">Corrección (había más)</option>
                  </>
                ) : (
                  <>
                    <option value="consumo">Se usó en la cocina</option>
                    <option value="merma">Se descartó (vencido o dañado)</option>
                    <option value="ajuste">Corrección (había menos)</option>
                  </>
                )}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="cantidad">
              <Form.Label>¿Cuánto? ({producto.unidad})</Form.Label>
              <Form.Control name="cantidad" type="number" min="0.01" step="any" required value={form.cantidad} onChange={handleChange} />
            </Form.Group>
            {form.tipo === 'ingreso' && (
              <Form.Group className="mb-3" controlId="fechaVencimiento">
                <Form.Label>Fecha de vencimiento (si tiene)</Form.Label>
                <Form.Control name="fechaVencimiento" type="date" value={form.fechaVencimiento} onChange={handleChange} />
              </Form.Group>
            )}
            {error && <p className="alert alert-danger">{error}</p>}
            <div className="formulario-pie">
              <Button variant="outline-secondary" onClick={() => navigate('/productos')}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar movimiento'}</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default Movimiento
