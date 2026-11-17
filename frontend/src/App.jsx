import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, GESTION, ROLES, useAuth } from './auth/AuthContext.jsx';
import LoginPage from './auth/LoginPage.jsx';
import AppShell from './layout/AppShell.jsx';
import { useTamanoLetra } from './hooks/useTamanoLetra.js';
import InicioPage from './pages/InicioPage.jsx';
import RacionesPage from './pages/RacionesPage.jsx';
import DespensaPage from './pages/DespensaPage.jsx';
import StockPage from './pages/StockPage.jsx';
import DonacionesPage from './pages/DonacionesPage.jsx';
import SemanaPage from './pages/SemanaPage.jsx';
import ReportesPage from './pages/ReportesPage.jsx';
import CuentaPage from './pages/CuentaPage.jsx';
import UsuariosPage from './pages/UsuariosPage.jsx';

export function Protegida({ children }) {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" replace />;
}

export function SoloRoles({ roles, children }) {
  const { usuario } = useAuth();
  return roles.includes(usuario.rol) ? children : <Navigate to="/" replace />;
}

export function Rutas({ letra }) {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Protegida><AppShell letra={letra} /></Protegida>}>
        <Route index element={<InicioPage />} />
        <Route path="raciones" element={<RacionesPage />} />
        <Route path="semana" element={<SemanaPage />} />
        <Route path="despensa" element={<SoloRoles roles={GESTION}><DespensaPage /></SoloRoles>}>
          <Route index element={<Navigate to="existencias" replace />} />
          <Route path="existencias" element={<StockPage />} />
          <Route path="donaciones" element={<DonacionesPage />} />
        </Route>
        <Route path="informes" element={<SoloRoles roles={GESTION}><ReportesPage /></SoloRoles>} />
        <Route path="cuenta" element={<CuentaPage letra={letra} />} />
        <Route path="usuarios" element={<SoloRoles roles={[ROLES.ADMIN]}><UsuariosPage /></SoloRoles>} />

        {/* Direcciones de versiones anteriores */}
        <Route path="stock" element={<Navigate to="/despensa/existencias" replace />} />
        <Route path="donaciones" element={<Navigate to="/despensa/donaciones" replace />} />
        <Route path="menus" element={<Navigate to="/semana" replace />} />
        <Route path="turnos" element={<Navigate to="/semana" replace />} />
        <Route path="reportes" element={<Navigate to="/informes" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const letra = useTamanoLetra();
  return (
    <AuthProvider>
      <BrowserRouter>
        <Rutas letra={letra} />
      </BrowserRouter>
    </AuthProvider>
  );
}
