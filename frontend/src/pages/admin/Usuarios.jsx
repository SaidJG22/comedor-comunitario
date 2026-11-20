import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button } from 'react-bootstrap'
import { FiPlus, FiEdit2, FiTrash2, FiKey, FiCheck, FiSlash } from 'react-icons/fi'
import axios from 'axios'
import useAuthStore from '../../store/useAuthStore'
import { BASE_URL, conToken } from '../../services/Api'
import { mensajeError } from '../../utils/errores'
import Encabezado from '../../components/Encabezado'

const Usuarios = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getUsuarios = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/usuarios`, conToken(user))
      setUsuarios(response.data)
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getUsuarios()
  }, [])

  // Activar o desactivar
  const cambiarEstado = async (usuario) => {
    if (usuario.activo && !window.confirm(`¿Desactivar a ${usuario.nombre}? No va a poder ingresar.`)) return
    try {
      await axios.patch(`${BASE_URL}/usuarios/${usuario.id}`, { activo: !usuario.activo }, conToken(user))
      getUsuarios()
    } catch (err) {
      alert(mensajeError(err))
    }
  }

  const handleDelete = async (usuario) => {
    const result = window.confirm(`¿Borrar la cuenta de ${usuario.nombre}? No se puede deshacer.`)
    if (!result) return
    try {
      await axios.delete(`${BASE_URL}/usuarios/${usuario.id}`, conToken(user))
      setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id))
    } catch (err) {
      alert(mensajeError(err))
    }
  }

  const inactivos = usuarios.filter((u) => !u.activo).length

  return (
    <>
      <Encabezado titulo="Usuarios y roles">
        <Button onClick={() => navigate('/usuarios/nuevo')}><FiPlus /> Nuevo usuario</Button>
      </Encabezado>
      {inactivos > 0 && (
        <p className="alert alert-warning">
          Hay {inactivos} cuenta(s) inactiva(s). Las creadas desde “Registrarse” aparecen acá: activalas para que puedan ingresar.
        </p>
      )}
      {error && <p className="alert alert-danger">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table hover responsive className="align-middle">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}{u.id === user.id && ' (vos)'}</td>
                <td>{u.email}</td>
                <td>{u.rol}</td>
                <td>{u.activo ? 'Activa' : 'Inactiva'}</td>
                <td className="text-end text-nowrap">
                  <Button size="sm" variant="outline-secondary" className="me-1" onClick={() => navigate(`/usuarios/${u.id}/editar`)}>
                    <FiEdit2 /> Editar
                  </Button>
                  <Button size="sm" variant="outline-secondary" className="me-1" onClick={() => navigate(`/usuarios/${u.id}/contrasena`)}>
                    <FiKey /> Contraseña
                  </Button>
                  {u.id !== user.id && (
                    <Button size="sm" variant={u.activo ? 'outline-danger' : 'outline-primary'} className="me-1" onClick={() => cambiarEstado(u)}>
                      {u.activo ? <><FiSlash /> Desactivar</> : <><FiCheck /> Activar</>}
                    </Button>
                  )}
                  {u.id !== user.id && Number(u.tiene_registros) === 0 && (
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(u)}>
                      <FiTrash2 /> Borrar
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

export default Usuarios
