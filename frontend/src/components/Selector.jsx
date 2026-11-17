export const SERVICIOS = [
  { valor: 'almuerzo', texto: 'Almuerzo' },
  { valor: 'merienda', texto: 'Merienda' },
];

/** Botones grandes de opción única (ej.: Almuerzo / Merienda). */
export default function Selector({ valor, onChange, opciones = SERVICIOS, etiqueta = 'Servicio' }) {
  return (
    <div className="segmentado" role="group" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          aria-pressed={valor === o.valor}
          className={valor === o.valor ? 'activo' : ''}
          onClick={() => onChange(o.valor)}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}
