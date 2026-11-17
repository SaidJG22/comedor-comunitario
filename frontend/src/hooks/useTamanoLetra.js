import { useCallback, useEffect, useState } from 'react';

const CLAVE = 'mesa_abierta_letra';
export const TAMANOS = [
  { valor: 'normal', texto: 'Normal', px: 18 },
  { valor: 'grande', texto: 'Grande', px: 21 },
  { valor: 'muy-grande', texto: 'Muy grande', px: 24 },
];

const leer = () => {
  try {
    return TAMANOS.some((t) => t.valor === localStorage.getItem(CLAVE)) ? localStorage.getItem(CLAVE) : 'normal';
  } catch {
    return 'normal';
  }
};

/** Tamaño de letra de toda la aplicación, recordado en este dispositivo (si el navegador lo permite). */
export function useTamanoLetra() {
  const [tamano, setTamano] = useState(leer);

  useEffect(() => {
    const px = TAMANOS.find((t) => t.valor === tamano)?.px ?? 18;
    document.documentElement.style.fontSize = `${px}px`;
    try {
      localStorage.setItem(CLAVE, tamano);
    } catch {
      /* sin almacenamiento: se aplica igual mientras la pestaña esté abierta */
    }
  }, [tamano]);

  const siguiente = useCallback(
    () => setTamano((t) => TAMANOS[(TAMANOS.findIndex((x) => x.valor === t) + 1) % TAMANOS.length].valor),
    [],
  );
  return { tamano, setTamano, siguiente };
}
