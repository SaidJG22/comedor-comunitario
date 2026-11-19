const TOKEN_KEY = 'cometuc_token';
const USER_KEY = 'cometuc_usuario';
const AVISO_KEY = 'cometuc_aviso';

export const sesion = {
  token: () => localStorage.getItem(TOKEN_KEY),
  usuario: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  },
  guardar(token, usuario) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  },
  limpiar() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  // Aviso del ingreso
  avisar(texto) {
    try {
      sessionStorage.setItem(AVISO_KEY, texto);
    } catch {
      /* sin almacenamiento */
    }
  },
  tomarAviso() {
    try {
      const t = sessionStorage.getItem(AVISO_KEY);
      sessionStorage.removeItem(AVISO_KEY);
      return t ?? '';
    } catch {
      return '';
    }
  },
};

export class ApiError extends Error {
  constructor(status, message, detalles) {
    super(message);
    this.status = status;
    this.detalles = detalles;
  }
}

/** Cliente de la API */
export async function api(ruta, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = sesion.token();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`/api${ruta}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'No hay conexión con el servidor. Intente nuevamente.');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) {
      sesion.limpiar();
      // Cuenta desactivada
      sesion.avisar(data?.error?.includes('no está activa') ? data.error : 'Tu sesión venció. Ingresá de nuevo para seguir.');
      window.dispatchEvent(new Event('sesion-vencida'));
    }
    throw new ApiError(res.status, data?.error ?? 'Ocurrió un error inesperado', data?.detalles);
  }
  return data;
}

/** Fecha de hoy */
export const hoyLocal = () => new Date().toLocaleDateString('sv-SE');
