import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Modal from './Modal.jsx';

const ConfirmarContext = createContext(async () => false);

/** Confirmación */
export function ConfirmarProvider({ children }) {
  const [pedido, setPedido] = useState(null);
  const resolver = useRef(null);

  const confirmar = useCallback(
    (opciones) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setPedido(opciones);
      }),
    [],
  );

  function responder(si) {
    resolver.current?.(si);
    resolver.current = null;
    setPedido(null);
  }

  return (
    <ConfirmarContext.Provider value={confirmar}>
      {children}
      {pedido && (
        <Modal titulo={pedido.titulo} tamano="chico" onCerrar={() => responder(false)}>
          {pedido.mensaje && <p>{pedido.mensaje}</p>}
          <div className="modal-pie">
            <button type="button" className="btn btn-outline-secondary" onClick={() => responder(false)}>
              {pedido.textoNo ?? 'Cancelar'}
            </button>
            <button type="button" className={pedido.peligro ? 'btn btn-danger' : 'btn btn-primary'} onClick={() => responder(true)}>
              {pedido.textoSi ?? 'Sí, continuar'}
            </button>
          </div>
        </Modal>
      )}
    </ConfirmarContext.Provider>
  );
}

export const useConfirmar = () => useContext(ConfirmarContext);
