import { Container } from 'react-bootstrap'
import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'
import Footer from './Footer'

// Panel privado
const Layout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavBar />
      <Container as="main" className="flex-grow-1 py-4">
        <Outlet />
      </Container>
      <Footer />
    </div>
  )
}

export default Layout
