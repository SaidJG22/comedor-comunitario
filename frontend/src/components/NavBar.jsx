import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiHome, FiCalendar, FiBox, FiUsers, FiBarChart2, FiUser, FiClipboard } from 'react-icons/fi'
import useAuthStore from '../store/useAuthStore'
import BotonTema from './BotonTema'

const NavBar = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const gestion = user.rol === 'Administrador' || user.rol === 'Responsable'
  const admin = user.rol === 'Administrador'

  const salir = () => {
    logout()
    navigate('/login')
  }

  return (
    <Navbar expand="lg" className="bg-body border-bottom barra">
      <Container>
        <Navbar.Brand as={Link} to="/" className="marca">
          <img src="/imagenes/logo-simbolo.jpg" alt="" width="40" height="40" />
          <img src="/imagenes/logo-nombre.jpg" alt="ComeTUC" width="114" height="22" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="menu" />
        <Navbar.Collapse id="menu">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end><FiHome /> Inicio</Nav.Link>
            <Nav.Link as={NavLink} to="/raciones"><FiClipboard /> Raciones</Nav.Link>
            <Nav.Link as={NavLink} to="/semana"><FiCalendar /> Semana</Nav.Link>
            {gestion && (
              <NavDropdown title={<><FiBox /> Despensa</>} id="menu-despensa">
                <NavDropdown.Item as={Link} to="/productos">Productos</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/donaciones">Donaciones</NavDropdown.Item>
                {admin && <NavDropdown.Item as={Link} to="/categorias">Categorías</NavDropdown.Item>}
              </NavDropdown>
            )}
            {gestion && <Nav.Link as={NavLink} to="/voluntarios"><FiUsers /> Voluntarios</Nav.Link>}
            {gestion && <Nav.Link as={NavLink} to="/informes"><FiBarChart2 /> Informes</Nav.Link>}
          </Nav>
          <Nav className="align-items-lg-center gap-2">
            <BotonTema />
            <NavDropdown title={<><FiUser /> {user.nombre}</>} id="menu-cuenta" align="end">
              <NavDropdown.Item as={Link} to="/cuenta">Mi cuenta</NavDropdown.Item>
              {admin && <NavDropdown.Item as={Link} to="/usuarios">Usuarios y roles</NavDropdown.Item>}
              <NavDropdown.Divider />
              <NavDropdown.Item as="button" onClick={salir}>Salir</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavBar
