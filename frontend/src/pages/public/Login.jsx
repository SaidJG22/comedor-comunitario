import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Card, Form, Button } from 'react-bootstrap'
import { FiLogIn } from 'react-icons/fi'
import axios from 'axios'
import useAuthStore from '../../store/useAuthStore'
import { BASE_URL } from '../../services/Api'
import { mensajeError } from '../../utils/errores'
import BotonTema from '../../components/BotonTema'

const Login = () => {
  const navigate = useNavigate()
  const { user, login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, { email, password })
      login({ ...response.data.usuario, token: response.data.token })
      navigate('/')
    } catch (err) {
      setError(err.response?.status === 401 ? 'Correo o contraseña incorrectos.' : mensajeError(err))
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  if (user && user.token) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="ingreso">
      <div className="ingreso-foto" />
      <div className="ingreso-lado">
        <Card className="ingreso-tarjeta shadow-sm">
          <Card.Body className="p-4">
            <BotonTema />
            <img src="/imagenes/logo-completo.jpg" alt="ComeTUC, comedor comunitario" className="ingreso-logo" />
            <h1 className="h4 text-center">Ingresar</h1>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </Form.Group>
              {error && <p className="alert alert-danger">{error}</p>}
              <Button type="submit" className="w-100" disabled={loading}>
                <FiLogIn /> {loading ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </Form>
            <p className="text-center mt-3 mb-0">
              ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
            </p>
          </Card.Body>
        </Card>
      </div>
    </main>
  )
}

export default Login
