import { create } from 'zustand';
import { api, sesion } from '../api/client.js';

/** Sesión (Zustand) */
export const useSesion = create((set) => ({
  usuario: sesion.token() ? sesion.usuario() : null,

  async login(email, password) {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } });
    sesion.guardar(data.token, data.usuario);
    set({ usuario: data.usuario });
  },

  logout() {
    sesion.limpiar();
    set({ usuario: null });
  },
}));

// Sesión vencida
window.addEventListener('sesion-vencida', () => useSesion.setState({ usuario: null }));
