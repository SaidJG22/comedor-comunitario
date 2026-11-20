import { Button } from 'react-bootstrap'
import { FiMoon, FiSun } from 'react-icons/fi'
import useAuthStore from '../store/useAuthStore'

// Modo oscuro
const BotonTema = ({ className = '' }) => {
  const { tema, cambiarTema } = useAuthStore()
  const oscuro = tema === 'dark'

  return (
    <Button
      variant="outline-secondary"
      className={`boton-tema ${className}`}
      onClick={cambiarTema}
      aria-label={oscuro ? 'Modo claro' : 'Modo oscuro'}
      title={oscuro ? 'Modo claro' : 'Modo oscuro'}
    >
      {oscuro ? <FiSun /> : <FiMoon />}
    </Button>
  )
}

export default BotonTema
