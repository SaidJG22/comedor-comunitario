import { Vacio } from './Campos.jsx';

/** Registro no disponible */
export default function NoDisponible({ mensaje, volver, textoVolver = 'Volver al listado' }) {
  return (
    <Vacio icono="alerta" accion={{ texto: textoVolver, icono: 'atras', onClick: volver }}>
      {mensaje}
    </Vacio>
  );
}
