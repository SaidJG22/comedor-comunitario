import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Form, Button } from 'react-bootstrap'
import axios from 'axios'
import useAuthStore from '../../store/useAuthStore'
import { BASE_URL, conToken } from '../../services/Api'
import { mensajeError } from '../../utils/errores'
import Encabezado from '../../components/Encabezado'

const VoluntarioForm = () => {
  const { id } = useParams()
  const editando = Boolean(id)
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!editando) return
    axios
      .get(`${BASE_URL}/voluntarios/${id}`, conToken(user))
      .then((response) => setNombre(response.data.nombre_visible))
      .catch((err) => setError(mensajeError(err)))
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (editando) {
        await axios.patch(`${BASE_URL}/voluntarios/${id}`, { nombreVisible: nombre }, conToken(user))
      } else {
        await axios.post(`${BASE_URL}/voluntarios`, { nombreVisible: nombre }, conToken(user))
      }
      navigate('/voluntarios')
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="formulario">
      <Encabezado titulo={editando ? 'Editar voluntario' : 'Nuevo voluntario'} />
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="nombre">
              <Form.Label>Nombre o apodo (sin datos personales)</Form.Label>
              <Form.Control required maxLength={80} value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </Form.Group>
            {error && <p className="alert alert-danger">{error}</p>}
            <div className="formulario-pie">
              <Button variant="outline-secondary" onClick={() => navigate('/voluntarios')}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default VoluntarioForm
