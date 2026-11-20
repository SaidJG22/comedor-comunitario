import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Form, Button } from 'react-bootstrap'
import axios from 'axios'
import { BASE_URL } from '../../services/Api'
import { mensajeError } from '../../utils/errores'
import BotonTema from '../../components/BotonTema'

const Registro = () => {
  const initialState = { nombre: '', email: '', password: '', repetir: '' }
  const [form, setForm] = useState(initialState)
  const [error, setError] = useState('')
  const [listo, setListo] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.repetir) {
      setError('Las dos contraseñas no coinciden.')
      return
    }
    setLoading(true)
    try {
      await axios.post(`${BASE_URL}/auth/registro`, { nombre: form.nombre, email: form.email, password: form.password })
      setListo(true)
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="ingreso">
      <div className="ingreso-foto" />
      <div className="ingreso-lado">
        <Card className="ingreso-tarjeta shadow-sm">
          <Card.Body className="p-4">
            <BotonTema />
            <img src="/imagenes/logo-completo.jpg" alt="ComeTUC, comedor comunitario" className="ingreso-logo" />
            {listo ? (
              <>
                <h1 className="h4 text-center">¡Listo!</h1>
                <p className="alert alert-success">
                  Tu cuenta quedó pendiente. Cuando el administrador la active, vas a poder ingresar.
                </p>
                <Link to="/login" className="btn btn-primary w-100">Ir a ingresar</Link>
              </>
            ) : (
              <>
                <h1 className="h4 text-center">Crear cuenta</h1>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="nombre">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control name="nombre" required value={form.nombre} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Correo electrónico</Form.Label>
                    <Form.Control name="email" type="email" required value={form.email} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Contraseña (mínimo 8 caracteres)</Form.Label>
                    <Form.Control name="password" type="password" minLength={8} required value={form.password} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="repetir">
                    <Form.Label>Repetir la contraseña</Form.Label>
                    <Form.Control name="repetir" type="password" required value={form.repetir} onChange={handleChange} />
                  </Form.Group>
                  {error && <p className="alert alert-danger">{error}</p>}
                  <Button type="submit" className="w-100" disabled={loading}>
                    {loading ? 'Creando...' : 'Crear cuenta'}
                  </Button>
                </Form>
                <p className="text-center mt-3 mb-0">
                  ¿Ya tenés cuenta? <Link to="/login">Ingresar</Link>
                </p>
              </>
            )}
          </Card.Body>
        </Card>
      </div>
    </main>
  )
}

export default Registro
