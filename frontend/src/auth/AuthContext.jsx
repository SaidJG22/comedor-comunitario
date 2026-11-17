import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, sesion } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => (sesion.token() ? sesion.usuario() : null));

  useEffect(() => {
    const alVencer = () => setUsuario(null);
    window.addEventListener('sesion-vencida', alVencer);
    return () => window.removeEventListener('sesion-vencida', alVencer);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } });
    sesion.guardar(data.token, data.usuario);
    setUsuario(data.usuario);
  }, []);

  const logout = useCallback(() => {
    sesion.limpiar();
    setUsuario(null);
  }, []);

  const value = useMemo(() => ({ usuario, login, logout }), [usuario, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};

export const ROLES = { ADMIN: 'Administrador', RESPONSABLE: 'Responsable', VOLUNTARIO: 'Voluntario' };
export const GESTION = [ROLES.ADMIN, ROLES.RESPONSABLE];
