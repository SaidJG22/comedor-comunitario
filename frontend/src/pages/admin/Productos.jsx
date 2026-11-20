import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Table, Button, Form } from 'react-bootstrap'
import { FiPlus, FiEdit2, FiTrash2, FiRepeat, FiSearch } from 'react-icons/fi'
import axios from 'axios'
import useAuthStore from '../../store/useAuthStore'
import { BASE_URL, conToken } from '../../services/Api'
import { mensajeError } from '../../utils/errores'
import { cantidad, fechaCorta } from '../../utils/formato'
import Encabezado from '../../components/Encabezado'

const Productos = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [productos, setProductos] = useState([])
  const [alertas, setAlertas] = useState({ stockBajo: [], porVencer: [] })
  const [search, setSearch] = useState('')
  const [categoria, setCategoria] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getProductos = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/stock/productos`, conToken(user))
      setProductos(response.data)
      const respAlertas = await axios.get(`${BASE_URL}/stock/alertas`, conToken(user))
      setAlertas(respAlertas.data)
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getProductos()
  }, [])

  // Borrar o dar de baja
  const handleDelete = async (producto) => {
    const conHistorial = Number(producto.tiene_historial) === 1
    const result = window.confirm(
      conHistorial
        ? `¿Dar de baja "${producto.nombre}"? Lo que ya se registró se conserva.`
        : `¿Borrar "${producto.nombre}"? No se puede deshacer.`,
    )
    if (!result) return
    try {
      if (conHistorial) {
        await axios.patch(`${BASE_URL}/stock/productos/${producto.id}`, { activo: false }, conToken(user))
      } else {
        await axios.delete(`${BASE_URL}/stock/productos/${producto.id}`, conToken(user))
      }
      getProductos()
    } catch (err) {
      alert(mensajeError(err))
    }
  }

  // Categorías del filtro
  const categorias = []
  productos.forEach((p) => {
    const nombre = p.categoria || 'Sin categoría'
    if (!categorias.includes(nombre)) categorias.push(nombre)
  })
  categorias.sort()

  const filteredProductos = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) &&
      (categoria === '' || (p.categoria || 'Sin categoría') === categoria),
  )
  const bajos = alertas.stockBajo.map((p) => p.id)

  return (
    <>
      <Encabezado titulo="Productos de la despensa">
        {user.rol === 'Administrador' && <Link to="/categorias" className="btn btn-outline-secondary">Editar categorías</Link>}
        <Button onClick={() => navigate('/productos/nuevo')}><FiPlus /> Nuevo producto</Button>
      </Encabezado>

      {(alertas.stockBajo.length > 0 || alertas.porVencer.length > 0) && (
        <div className="alert alert-warning">
          <strong>Atención</strong>
          <ul className="mb-0">
            {alertas.stockBajo.map((p) => (
              <li key={`b${p.id}`}>Queda poco {p.nombre}: {cantidad(p.stock_actual, p.unidad)}</li>
            ))}
            {alertas.porVencer.map((l) => (
              <li key={`v${l.lote_id}`}>{l.nombre} vence el {fechaCorta(l.fecha_vencimiento)}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <Form.Label htmlFor="buscar"><FiSearch /> Buscar producto</Form.Label>
          <Form.Control id="buscar" placeholder="Nombre del producto" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="col-md-6">
          <Form.Label htmlFor="categoria">Categoría</Form.Label>
          <Form.Select id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Form.Select>
        </div>
      </div>

      {error && <p className="alert alert-danger">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table hover responsive className="align-middle">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th className="text-end">Hay</th>
              <th className="text-end">Mínimo</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProductos.map((p) => (
              <tr key={p.id} className={bajos.includes(p.id) ? 'table-danger' : ''}>
                <td>{p.nombre}</td>
                <td>{p.categoria || 'Sin categoría'}</td>
                <td className="text-end fw-bold">{cantidad(p.stock_actual, p.unidad)}</td>
                <td className="text-end">{cantidad(p.stock_minimo, p.unidad)}</td>
                <td className="text-end text-nowrap">
                  <Button size="sm" className="me-1" onClick={() => navigate(`/productos/${p.id}/movimiento`)}>
                    <FiRepeat /> Llegó / se usó
                  </Button>
                  <Button size="sm" variant="outline-secondary" className="me-1" onClick={() => navigate(`/productos/${p.id}/editar`)}>
                    <FiEdit2 /> Editar
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(p)}>
                    <FiTrash2 /> {Number(p.tiene_historial) === 1 ? 'Dar de baja' : 'Borrar'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {!loading && filteredProductos.length === 0 && <p className="text-secondary">No hay productos para mostrar.</p>}
    </>
  )
}

export default Productos
