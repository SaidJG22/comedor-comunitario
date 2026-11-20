export const BASE_URL = 'http://localhost:3000/api'

// Token del usuario
export const conToken = (user) => ({
  headers: { Authorization: `Bearer ${user.token}` },
})
