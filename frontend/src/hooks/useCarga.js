import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';

/**
 * Carga datos de la API al montar y cada vez que cambia `ruta`.
 * Con `ruta = null` no consulta (útil cuando faltan parámetros).
 * Devuelve { datos, cargando, error, recargar }.
 */
export function useCarga(ruta) {
  const [estado, setEstado] = useState({ datos: null, cargando: Boolean(ruta), error: '' });
  const vigente = useRef(0);

  const cargar = useCallback(async () => {
    if (!ruta) {
      setEstado({ datos: null, cargando: false, error: '' });
      return;
    }
    const id = ++vigente.current;
    setEstado((e) => ({ ...e, cargando: true, error: '' }));
    try {
      const datos = await api(ruta);
      if (id === vigente.current) setEstado({ datos, cargando: false, error: '' });
    } catch (err) {
      if (id === vigente.current) setEstado({ datos: null, cargando: false, error: err.message });
    }
  }, [ruta]);

  useEffect(() => {
    cargar();
    return () => {
      vigente.current += 1; // descarta respuestas de pedidos anteriores
    };
  }, [cargar]);

  return { ...estado, recargar: cargar };
}
