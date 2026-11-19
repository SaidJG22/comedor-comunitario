/** Ayuda plegable */
export default function AyudaPlegable({ titulo = '¿Cómo se usa?', children }) {
  return (
    <details className="ayuda-caja">
      <summary>{titulo}</summary>
      <div className="ayuda-cuerpo">{children}</div>
    </details>
  );
}
