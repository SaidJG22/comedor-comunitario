import { fechaCorta, lunesDe, sumarDias } from '../utils/formato.js';
import { hoyLocal } from '../api/client.js';

/** Navegación por semanas: anterior / esta semana / siguiente. `lunes` es AAAA-MM-DD. */
export default function SemanaNav({ lunes, onChange }) {
  return (
    <div className="semana-nav">
      <button type="button" className="btn-sec" onClick={() => onChange(sumarDias(lunes, -7))}>
        ← Anterior
      </button>
      <button type="button" className="btn-sec" onClick={() => onChange(lunesDe(hoyLocal()))}>
        Hoy
      </button>
      <button type="button" className="btn-sec" onClick={() => onChange(sumarDias(lunes, 7))}>
        Siguiente →
      </button>
      <p className="sub" aria-live="polite">
        Semana del {fechaCorta(lunes)} al {fechaCorta(sumarDias(lunes, 6))}
      </p>
    </div>
  );
}
