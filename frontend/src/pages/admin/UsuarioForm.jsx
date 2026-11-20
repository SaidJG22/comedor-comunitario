import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Form, Button } from 'react-bootstrap'
import axios from 'axios'
import useAuthStore from '../../store/useAuthStore'
import { BASE_URL, conToken } from '../../services/Api'
import { mensajeError } from '../../utils/errores'
import Encabezado from '../../components/Encabezado'

const UsuarioForm = () => {
  const { id } = useParams()
  const editando = Boolean(id)
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const soyYo = editando && Number(id) === user.id
  const initialState = { nombre: '', email: '', password: '', rol: 'Voluntario' }
  const [form, setForm] = useState(initialState)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!editando) return
    axios
      .get(`${BASE_URL}/usuarios/${id}`, conToken(user))
      .then((response) => setForm({ nombre: response.data.nombre, email: response.data.email, password: '', rol: response.data.rol }))
      .catch((err) => setError(mensajeError(err)))
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
      if (editando) {
        const cambios = { nombre: form.nombre, email: form.email }
        // Rol propio fijo
        if (!soyYo) cambios.rol = form.rol
        await axios.patch(`${BASE_URL}/usuarios/${id}`, cambios, conToken(user))
      } else {
        await axios.post(`${BASE_URL}/usuarios`, form, conToken(user))
      }
      navigate('/usuarios')
    } catch (err) {
      setError(err.response?.status === 409 ? 'Ya hay una cuenta con ese correo.' : mensajeError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="formulario">
      <Encabezado titulo={editando ? 'Editar usuario' : 'Nuevo usuario'} />
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control name="nombre" required maxLength={80} value={form.nombre} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control name="email" type="email" required value={form.email} onChange={handleChange} />
            </Form.Group>
            {!editando && (
              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Contraseña inicial (mínimo 8 caracteres)</Form.Label>
                <Form.Control name="password" type="password" minLength={8} required value={form.password} onChange={handleChange} />
              </Form.Group>
            )}
            <Form.Group className="mb-3" controlId="rol">
              <Form.Label>Rol</Form.Label>
              <Form.Select name="rol" value={form.rol} disabled={soyYo} onChange={handleChange}>
                <option value="Administrador">Administrador</option>
                <option value="Responsable">Responsable</option>
                <option value="Voluntario">Voluntario</option>
              </Form.Select>
              {soyYo && <Form.Text>No podés cambiar tu propio rol.</Form.Text>}
            </Form.Group>
            {error && <p className="alert alert-danger">{error}</p>}
            <div className="formulario-pie">
              <Button variant="outline-secondary" onClick={() => navigate('/usuarios')}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default UsuarioForm
