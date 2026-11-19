// Íconos
const TRAZOS = {
  inicio: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  raciones: 'M3 12h18a9 9 0 0 1-18 0z M8 8c0-2 2-2 2-4 M13 8c0-2 2-2 2-4',
  despensa: 'M3 7l9-4 9 4v10l-9 4-9-4z M3 7l9 4 9-4 M12 11v10',
  semana: 'M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4',
  informes: 'M4 20V10 M10 20V4 M16 20v-8 M22 20H2',
  cuenta: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0',
  tilde: 'M5 13l4 4L19 7',
  mas: 'M12 5v14 M5 12h14',
  editar: 'M4 20h4L19 9l-4-4L4 16z M14 6l4 4',
  borrar: 'M4 7h16 M10 11v6 M14 11v6 M6 7l1 13h10l1-13 M9 7V4h6v3',
  cerrar: 'M6 6l12 12 M18 6L6 18',
  alerta: 'M12 3l10 18H2z M12 10v4 M12 17.5v.5',
  grafico: 'M3 3v18h18 M7 15l4-4 3 3 5-6',
  flecha: 'M5 12h14 M13 6l6 6-6 6',
  atras: 'M19 12H5 M11 6l-6 6 6 6',
  baja: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0 M8 12h8',
  reactivar: 'M4 12a8 8 0 1 0 2.3-5.7 M4 4v4h4',
  llave: 'M15 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10z M11.5 12.5L4 20 M7 17l2 2 M5 19l2 2',
  movimiento: 'M7 4v16 M3 8l4-4 4 4 M17 20V4 M13 16l4 4 4-4',
  usuarios: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21a7 7 0 0 1 14 0 M16 3.5a4 4 0 0 1 0 7 M22 21a7 7 0 0 0-4-6.3',
  donacion: 'M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z',
  reloj: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 3',
  foto: 'M4 8h3l2-3h6l2 3h3v11H4z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  buscar: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M20 20l-4-4',
  categoria: 'M3 3h8l10 10-8 8L3 11z M7.5 7.5h.01',
};

export default function Icono({ nombre, tamano = 24 }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={TRAZOS[nombre]} />
    </svg>
  );
}
