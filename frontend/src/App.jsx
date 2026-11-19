import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { GESTION, ROLES } from './auth/roles.js';
import { useSesion } from './store/sesion.js';
import LoginPage from './pages/login/LoginPage.jsx';
import RegistroPage from './pages/registro/RegistroPage.jsx';
import AppShell from './layout/AppShell.jsx';
import InicioPage from './pages/inicio/InicioPage.jsx';
import RacionesPage from './pages/raciones/RacionesPage.jsx';
import DespensaLayout from './pages/despensa/DespensaLayout.jsx';
import ExistenciasPage from './pages/despensa/ExistenciasPage.jsx';
import ProductoFormPage from './pages/despensa/ProductoFormPage.jsx';
import DonacionesPage from './pages/despensa/DonacionesPage.jsx';
import DonacionFormPage from './pages/despensa/DonacionFormPage.jsx';
import DonacionDetallePage from './pages/despensa/DonacionDetallePage.jsx';
import CategoriasPage from './pages/despensa/CategoriasPage.jsx';
import CategoriaFormPage from './pages/despensa/CategoriaFormPage.jsx';
import SemanaLayout from './pages/semana/SemanaLayout.jsx';
import SemanaPage from './pages/semana/SemanaPage.jsx';
import MenuFormPage from './pages/semana/MenuFormPage.jsx';
import MenuDetallePage from './pages/semana/MenuDetallePage.jsx';
import VoluntariosPage from './pages/semana/VoluntariosPage.jsx';
import VoluntarioFormPage from './pages/semana/VoluntarioFormPage.jsx';
import InformesPage from './pages/informes/InformesPage.jsx';
import CuentaPage from './pages/cuenta/CuentaPage.jsx';
import UsuariosPage from './pages/usuarios/UsuariosPage.jsx';
import UsuarioFormPage from './pages/usuarios/UsuarioFormPage.jsx';
import ContrasenaPage from './pages/usuarios/ContrasenaPage.jsx';

function Protegida({ children }) {
  const { usuario } = useSesion();
  return usuario ? children : <Navigate to="/login" replace />;
}

function SoloRoles({ roles, children }) {
  const { usuario } = useSesion();
  return roles.includes(usuario.rol) ? (children ?? <Outlet />) : <Navigate to="/" replace />;
}

function Rutas() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />

      {/* Privadas */}
      <Route element={<Protegida><AppShell /></Protegida>}>
        <Route index element={<InicioPage />} />
        <Route path="raciones" element={<RacionesPage />} />

        <Route path="despensa" element={<SoloRoles roles={GESTION}><DespensaLayout /></SoloRoles>}>
          <Route index element={<Navigate to="existencias" replace />} />
          <Route path="existencias" element={<ExistenciasPage />} />
          <Route path="existencias/nuevo" element={<ProductoFormPage />} />
          <Route path="existencias/:id/editar" element={<ProductoFormPage />} />
          <Route path="donaciones" element={<DonacionesPage />} />
          <Route path="donaciones/nueva" element={<DonacionFormPage />} />
          <Route path="donaciones/:id" element={<DonacionDetallePage />} />
          <Route path="donaciones/:id/editar" element={<DonacionFormPage />} />
          <Route element={<SoloRoles roles={[ROLES.ADMIN]} />}>
            <Route path="categorias" element={<CategoriasPage />} />
            <Route path="categorias/nueva" element={<CategoriaFormPage />} />
            <Route path="categorias/:id/editar" element={<CategoriaFormPage />} />
          </Route>
        </Route>

        <Route path="semana" element={<SemanaLayout />}>
          <Route index element={<SemanaPage />} />
          <Route path="menus/:id" element={<MenuDetallePage />} />
          <Route element={<SoloRoles roles={GESTION} />}>
            <Route path="menus/nuevo" element={<MenuFormPage />} />
            <Route path="menus/:id/editar" element={<MenuFormPage />} />
            <Route path="equipo" element={<VoluntariosPage />} />
            <Route path="equipo/nuevo" element={<VoluntarioFormPage />} />
            <Route path="equipo/:id/editar" element={<VoluntarioFormPage />} />
          </Route>
        </Route>

        <Route path="informes" element={<SoloRoles roles={GESTION}><InformesPage /></SoloRoles>} />
        <Route path="cuenta" element={<CuentaPage />} />
        <Route path="usuarios" element={<SoloRoles roles={[ROLES.ADMIN]} />}>
          <Route index element={<UsuariosPage />} />
          <Route path="nuevo" element={<UsuarioFormPage />} />
          <Route path=":id/editar" element={<UsuarioFormPage />} />
          <Route path=":id/contrasena" element={<ContrasenaPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Rutas />
    </BrowserRouter>
  );
}
