export const SERVICIOS = [
  { valor: 'almuerzo', texto: 'Almuerzo' },
  { valor: 'merienda', texto: 'Merienda' },
];

/** Selector */
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
