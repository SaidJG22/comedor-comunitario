import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Form, Button } from 'react-bootstrap'
import axios from 'axios'
import useAuthStore from '../../store/useAuthStore'
import { BASE_URL, conToken } from '../../services/Api'
import { mensajeError } from '../../utils/errores'
import Encabezado from '../../components/Encabezado'

const ProductoForm = () => {
  const { id } = useParams()
  const editando = Boolean(id)
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const initialState = { nombre: '', categoriaId: '', unidad: 'kg', stockMinimo: 0 }
  const [form, setForm] = useState(initialState)
  const [categorias, setCategorias] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/stock/categorias`, conToken(user))
        setCategorias(response.data)
        if (editando) {
          const respProducto = await axios.get(`${BASE_URL}/stock/productos/${id}`, conToken(user))
          const p = respProducto.data
          setForm({ nombre: p.nombre, categoriaId: p.categoria_id || '', unidad: p.unidad, stockMinimo: p.stock_minimo })
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const categoriaId = form.categoriaId ? Number(form.categoriaId) : null
      if (editando) {
        await axios.put(
          `${BASE_URL}/stock/productos/${id}`,
          { nombre: form.nombre, categoriaId, stockMinimo: Number(form.stockMinimo) },
          conToken(user),
        )
      } else {
        await axios.post(
          `${BASE_URL}/stock/productos`,
          { nombre: form.nombre, categoriaId: categoriaId || undefined, unidad: form.unidad, stockMinimo: Number(form.stockMinimo) },
          conToken(user),
        )
      }
      navigate('/productos')
    } catch (err) {
      setError(err.response?.status === 409 ? 'Ya hay un producto con ese nombre.' : mensajeError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="formulario">
      <Encabezado titulo={editando ? 'Editar producto' : 'Nuevo producto'} />
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control name="nombre" required maxLength={80} value={form.nombre} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="categoriaId">
              <Form.Label>Categoría</Form.Label>
              <Form.Select name="categoriaId" value={form.categoriaId} onChange={handleChange}>
                <option value="">Sin categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="unidad">
              <Form.Label>Se mide en</Form.Label>
              <Form.Select name="unidad" value={form.unidad} disabled={editando} onChange={handleChange}>
                <option value="kg">kilos (kg)</option>
                <option value="g">gramos (g)</option>
                <option value="l">litros (l)</option>
                <option value="ml">mililitros (ml)</option>
                <option value="unidad">unidades</option>
              </Form.Select>
              {editando && <Form.Text>La unidad no se cambia: ya hay movimientos en esa unidad.</Form.Text>}
            </Form.Group>
            <Form.Group className="mb-3" controlId="stockMinimo">
              <Form.Label>Stock mínimo (avisa cuando queda menos)</Form.Label>
              <Form.Control name="stockMinimo" type="number" min="0" step="any" value={form.stockMinimo} onChange={handleChange} />
            </Form.Group>
            {error && <p className="alert alert-danger">{error}</p>}
            <div className="formulario-pie">
              <Button variant="outline-secondary" onClick={() => navigate('/productos')}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default ProductoForm
