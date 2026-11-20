import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Form } from 'react-bootstrap'
import { FiPlus, FiEdit2, FiTrash2, FiRotateCcw } from 'react-icons/fi'
import axios from 'axios'
import useAuthStore from '../../store/useAuthStore'
import { BASE_URL, conToken } from '../../services/Api'
import { mensajeError } from '../../utils/errores'
import Encabezado from '../../components/Encabezado'

const Voluntarios = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [voluntarios, setVoluntarios] = useState([])
  const [verBajas, setVerBajas] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getVoluntarios = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/voluntarios?todos=${verBajas ? 1 : 0}`, conToken(user))
      setVoluntarios(response.data)
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getVoluntarios()
  }, [verBajas])

  // Borrar o dar de baja
  const handleDelete = async (voluntario) => {
    const conTurnos = Number(voluntario.tiene_turnos) === 1
    const result = window.confirm(
      conTurnos
        ? `¿Dar de baja a ${voluntario.nombre_visible}? Ya tuvo turnos y se conservan.`
        : `¿Borrar a ${voluntario.nombre_visible}?`,
    )
    if (!result) return
    try {
      if (conTurnos) {
        await axios.patch(`${BASE_URL}/voluntarios/${voluntario.id}`, { activo: false }, conToken(user))
      } else {
        await axios.delete(`${BASE_URL}/voluntarios/${voluntario.id}`, conToken(user))
      }
      getVoluntarios()
    } catch (err) {
      alert(mensajeError(err))
    }
  }

  const reactivar = async (voluntario) => {
    try {
      await axios.patch(`${BASE_URL}/voluntarios/${voluntario.id}`, { activo: true }, conToken(user))
      getVoluntarios()
    } catch (err) {
      alert(mensajeError(err))
    }
  }

  return (
    <>
      <Encabezado titulo="Voluntarios">
        <Button onClick={() => navigate('/voluntarios/nuevo')}><FiPlus /> Nuevo voluntario</Button>
      </Encabezado>
      <Form.Check type="switch" id="ver-bajas" className="mb-3" label="Mostrar también los dados de baja"
        checked={verBajas} onChange={(e) => setVerBajas(e.target.checked)} />
      {error && <p className="alert alert-danger">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table hover responsive className="align-middle">
          <thead>
            <tr>
              <th>Nombre o apodo</th>
              <th>Estado</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {voluntarios.map((v) => (
              <tr key={v.id}>
                <td>{v.nombre_visible}</td>
                <td>{v.activo ? 'Activo' : 'De baja'}</td>
                <td className="text-end text-nowrap">
                  <Button size="sm" variant="outline-secondary" className="me-1" onClick={() => navigate(`/voluntarios/${v.id}/editar`)}>
                    <FiEdit2 /> Editar
                  </Button>
                  {v.activo ? (
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(v)}>
                      <FiTrash2 /> {Number(v.tiene_turnos) === 1 ? 'Dar de baja' : 'Borrar'}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline-primary" onClick={() => reactivar(v)}>
                      <FiRotateCcw /> Reactivar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}

export default Voluntarios
