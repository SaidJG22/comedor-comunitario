import { create } from 'zustand'

const useAuthStore = create((set) => ({
  // Propiedades
  user: JSON.parse(localStorage.getItem('user')) || null,
  tema: localStorage.getItem('tema') || 'light',

  // Métodos
  login: (nuevoUser) => {
    localStorage.setItem('user', JSON.stringify(nuevoUser))
    set({ user: nuevoUser })
  },
  logout: () => {
    localStorage.removeItem('user')
    set({ user: null })
  },
  cambiarTema: () =>
    set((state) => {
      const nuevoTema = state.tema === 'light' ? 'dark' : 'light'
      localStorage.setItem('tema', nuevoTema)
      return { tema: nuevoTema }
    }),
}))

export default useAuthStore
