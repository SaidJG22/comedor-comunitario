// Íconos simples (trazo) para la barra de navegación. Siempre van acompañados de texto.
const TRAZOS = {
  inicio: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  raciones: 'M3 12h18a9 9 0 0 1-18 0z M8 8c0-2 2-2 2-4 M13 8c0-2 2-2 2-4',
  despensa: 'M3 7l9-4 9 4v10l-9 4-9-4z M3 7l9 4 9-4 M12 11v10',
  semana: 'M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4',
  informes: 'M4 20V10 M10 20V4 M16 20v-8 M22 20H2',
  cuenta: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0',
  tilde: 'M5 13l4 4L19 7',
};

export default function Icono({ nombre, tamano = 24 }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={TRAZOS[nombre]} />
    </svg>
  );
}
