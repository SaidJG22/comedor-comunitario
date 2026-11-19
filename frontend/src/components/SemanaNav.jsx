import { fechaCorta, lunesDe, sumarDias } from '../utils/formato.js';
import { hoyLocal } from '../api/client.js';

/** Navegación por semanas */
export default function SemanaNav({ lunes, onChange }) {
  return (
    <div className="semana-nav">
      <button type="button" className="btn btn-outline-secondary" onClick={() => onChange(sumarDias(lunes, -7))}>
        ← Anterior
      </button>
      <button type="button" className="btn btn-outline-secondary" onClick={() => onChange(lunesDe(hoyLocal()))}>
        Hoy
      </button>
      <button type="button" className="btn btn-outline-secondary" onClick={() => onChange(sumarDias(lunes, 7))}>
        Siguiente →
      </button>
      <p className="sub" aria-live="polite">
        Semana del {fechaCorta(lunes)} al {fechaCorta(sumarDias(lunes, 6))}
      </p>
    </div>
  );
}
