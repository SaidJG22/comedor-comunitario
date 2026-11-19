import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Icono from './Iconos.jsx';

const AvisosContext = createContext(() => {});

/** Avisos flotantes */
export function AvisosProvider({ children }) {
  const [avisos, setAvisos] = useState([]);
  const siguiente = useRef(0);

  const quitar = useCallback((id) => setAvisos((a) => a.filter((x) => x.id !== id)), []);

  const avisar = useCallback(
    (texto, tipo = 'ok') => {
      const id = ++siguiente.current;
      setAvisos((a) => [...a.slice(-2), { id, texto, tipo }]);
      setTimeout(() => quitar(id), tipo === 'error' ? 7000 : 4500);
    },
    [quitar],
  );

  return (
    <AvisosContext.Provider value={avisar}>
      {children}
      <div className="avisos">
        {avisos.map((a) => (
          <div key={a.id} className={`aviso-flotante aviso-${a.tipo}`} role={a.tipo === 'error' ? 'alert' : 'status'}>
            <span className="icono-estado"><Icono nombre={a.tipo === 'error' ? 'alerta' : 'tilde'} tamano={16} /></span>
            <span className="texto">{a.texto}</span>
            <button type="button" aria-label="Cerrar aviso" onClick={() => quitar(a.id)}>
              <Icono nombre="cerrar" tamano={18} />
            </button>
          </div>
        ))}
      </div>
    </AvisosContext.Provider>
  );
}

/** Hook de avisos */
export const useAviso = () => useContext(AvisosContext);
