import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Form, Button } from 'react-bootstrap'
import axios from 'axios'
import useAuthStore from '../../store/useAuthStore'
import { BASE_URL, conToken } from '../../services/Api'
import { mensajeError } from '../../utils/errores'
import Encabezado from '../../components/Encabezado'

const Cuenta = () => {
  const { user } = useAuthStore()
  const initialState = { actual: '', nueva: '', repetir: '' }
  const [form, setForm] = useState(initialState)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensaje('')
    setError('')
    if (form.nueva !== form.repetir) {
      setError('Las dos contraseñas nuevas no coinciden.')
      return
    }
    setSaving(true)
    try {
      await axios.patch(`${BASE_URL}/auth/password`, { actual: form.actual, nueva: form.nueva }, conToken(user))
      setMensaje('Tu contraseña se cambió.')
      setForm(initialState)
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="formulario">
      <Encabezado titulo="Mi cuenta" descripcion={`${user.nombre} · ${user.rol}`}>
        {user.rol === 'Administrador' && <Link to="/usuarios" className="btn btn-outline-primary">Usuarios y roles</Link>}
      </Encabezado>
      <Card>
        <Card.Body>
          <Card.Title as="h2" className="h5">Cambiar mi contraseña</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="actual">
              <Form.Label>Contraseña actual</Form.Label>
              <Form.Control name="actual" type="password" required value={form.actual} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="nueva">
              <Form.Label>Contraseña nueva (mínimo 8 caracteres)</Form.Label>
              <Form.Control name="nueva" type="password" minLength={8} required value={form.nueva} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="repetir">
              <Form.Label>Repetir la contraseña nueva</Form.Label>
              <Form.Control name="repetir" type="password" required value={form.repetir} onChange={handleChange} />
            </Form.Group>
            {mensaje && <p className="alert alert-success">{mensaje}</p>}
            {error && <p className="alert alert-danger">{error}</p>}
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Cambiar contraseña'}</Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default Cuenta
