import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import useAuthStore from './store/useAuthStore'
import UsersRoute from './router/UsersRoute'
import GestionRoute from './router/GestionRoute'
import AdminRoute from './router/AdminRoute'
import Layout from './components/Layout'
import Login from './pages/public/Login'
import Registro from './pages/public/Registro'
import NotFound from './pages/public/NotFound'
import Unauthorized from './pages/public/Unauthorized'
import Home from './pages/users/Home'
import Raciones from './pages/users/Raciones'
import Semana from './pages/users/Semana'
import MenuDetalle from './pages/users/MenuDetalle'
import Cuenta from './pages/users/Cuenta'
import Productos from './pages/admin/Productos'
import ProductoForm from './pages/admin/ProductoForm'
import Movimiento from './pages/admin/Movimiento'
import Categorias from './pages/admin/Categorias'
import CategoriaForm from './pages/admin/CategoriaForm'
import Donaciones from './pages/admin/Donaciones'
import DonacionForm from './pages/admin/DonacionForm'
import DonacionDetalle from './pages/admin/DonacionDetalle'
import MenuForm from './pages/admin/MenuForm'
import Voluntarios from './pages/admin/Voluntarios'
import VoluntarioForm from './pages/admin/VoluntarioForm'
import Informes from './pages/admin/Informes'
import Usuarios from './pages/admin/Usuarios'
import UsuarioForm from './pages/admin/UsuarioForm'
import Contrasena from './pages/admin/Contrasena'

const App = () => {
  const { tema } = useAuthStore()

  // Modo oscuro
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', tema)
  }, [tema])

  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Privadas */}
        <Route element={<UsersRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/raciones" element={<Raciones />} />
            <Route path="/semana" element={<Semana />} />
            <Route path="/semana/menus/:id" element={<MenuDetalle />} />
            <Route path="/cuenta" element={<Cuenta />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Admin y Responsable */}
            <Route element={<GestionRoute />}>
              <Route path="/productos" element={<Productos />} />
              <Route path="/productos/nuevo" element={<ProductoForm />} />
              <Route path="/productos/:id/editar" element={<ProductoForm />} />
              <Route path="/productos/:id/movimiento" element={<Movimiento />} />
              <Route path="/donaciones" element={<Donaciones />} />
              <Route path="/donaciones/nueva" element={<DonacionForm />} />
              <Route path="/donaciones/:id" element={<DonacionDetalle />} />
              <Route path="/donaciones/:id/editar" element={<DonacionForm />} />
              <Route path="/semana/menus/nuevo" element={<MenuForm />} />
              <Route path="/semana/menus/:id/editar" element={<MenuForm />} />
              <Route path="/voluntarios" element={<Voluntarios />} />
              <Route path="/voluntarios/nuevo" element={<VoluntarioForm />} />
              <Route path="/voluntarios/:id/editar" element={<VoluntarioForm />} />
              <Route path="/informes" element={<Informes />} />
            </Route>

            {/* Solo Administrador */}
            <Route element={<AdminRoute />}>
              <Route path="/categorias" element={<Categorias />} />
              <Route path="/categorias/nueva" element={<CategoriaForm />} />
              <Route path="/categorias/:id/editar" element={<CategoriaForm />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/usuarios/nuevo" element={<UsuarioForm />} />
              <Route path="/usuarios/:id/editar" element={<UsuarioForm />} />
              <Route path="/usuarios/:id/contrasena" element={<Contrasena />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
