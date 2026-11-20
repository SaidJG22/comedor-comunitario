import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button } from 'react-bootstrap'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import axios from 'axios'
import useAuthStore from '../../store/useAuthStore'
import { BASE_URL, conToken } from '../../services/Api'
import { mensajeError } from '../../utils/errores'
import Encabezado from '../../components/Encabezado'

const Categorias = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getCategorias = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/stock/categorias`, conToken(user))
      setCategorias(response.data)
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getCategorias()
  }, [])

  const handleDelete = async (categoria) => {
    const result = window.confirm(`¿Borrar la categoría "${categoria.nombre}"? Sus productos quedan sin categoría.`)
    if (!result) return
    try {
      await axios.delete(`${BASE_URL}/stock/categorias/${categoria.id}`, conToken(user))
      setCategorias((prev) => prev.filter((c) => c.id !== categoria.id))
    } catch (err) {
      alert(mensajeError(err))
    }
  }

  return (
    <>
      <Encabezado titulo="Categorías">
        <Button onClick={() => navigate('/categorias/nueva')}><FiPlus /> Nueva categoría</Button>
      </Encabezado>
      {error && <p className="alert alert-danger">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table hover responsive className="align-middle">
          <thead>
            <tr>
              <th>Nombre</th>
              <th className="text-end">Productos</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td className="text-end">{c.productos}</td>
                <td className="text-end text-nowrap">
                  <Button size="sm" variant="outline-secondary" className="me-1" onClick={() => navigate(`/categorias/${c.id}/editar`)}>
                    <FiEdit2 /> Editar
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(c)}>
                    <FiTrash2 /> Borrar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}

export default Categorias
