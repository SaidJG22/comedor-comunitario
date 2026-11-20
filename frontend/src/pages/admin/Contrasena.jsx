import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Form, Button } from 'react-bootstrap'
import axios from 'axios'
import useAuthStore from '../../store/useAuthStore'
import { BASE_URL, conToken } from '../../services/Api'
import { mensajeError } from '../../utils/errores'
import Encabezado from '../../components/Encabezado'

// Restablecer contraseña
const Contrasena = () => {
  const { id } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [repetir, setRepetir] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== repetir) {
      setError('Las dos contraseñas no coinciden.')
      return
    }
    setSaving(true)
    try {
      await axios.patch(`${BASE_URL}/usuarios/${id}/password`, { password }, conToken(user))
      alert('Se cambió la contraseña.')
      navigate('/usuarios')
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="formulario">
      <Encabezado titulo="Nueva contraseña" />
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña nueva (mínimo 8 caracteres)</Form.Label>
              <Form.Control type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="repetir">
              <Form.Label>Repetir la contraseña</Form.Label>
              <Form.Control type="password" required value={repetir} onChange={(e) => setRepetir(e.target.value)} />
            </Form.Group>
            {error && <p className="alert alert-danger">{error}</p>}
            <div className="formulario-pie">
              <Button variant="outline-secondary" onClick={() => navigate('/usuarios')}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Cambiar contraseña'}</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default Contrasena
