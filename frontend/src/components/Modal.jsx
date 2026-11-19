import { useEffect, useId, useRef } from 'react';
import Icono from './Iconos.jsx';

/** Ventana */
export default function Modal({ titulo, onCerrar, children, tamano = '' }) {
  const ref = useRef(null);
  const idTitulo = useId();

  useEffect(() => {
    const dialogo = ref.current;
    const anterior = document.activeElement;
    if (!dialogo.open) dialogo.showModal();
    return () => {
      if (dialogo.open) dialogo.close();
      anterior?.focus?.();
    };
  }, []);

  // Esc
  function cancelar(e) {
    e.preventDefault();
    onCerrar();
  }

  // Clic en el fondo
  function tocarFondo(e) {
    if (e.target === ref.current) onCerrar();
  }

  return (
    <dialog ref={ref} className={`ventana ${tamano}`} aria-labelledby={idTitulo} onCancel={cancelar} onClick={tocarFondo}>
      <div className="modal-cabecera">
        <h2 id={idTitulo}>{titulo}</h2>
        <button type="button" className="boton-cerrar" onClick={onCerrar}>
          <Icono nombre="cerrar" tamano={20} /> Cerrar
        </button>
      </div>
      <div className="modal-cuerpo">{children}</div>
    </dialog>
  );
}
