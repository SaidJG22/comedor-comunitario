import { useId } from 'react';
import Icono from './Iconos.jsx';

/** Buscador */
export default function Buscador({ etiqueta, valor, onChange, placeholder }) {
  const id = useId();
  return (
    <div className="buscador">
      <label htmlFor={id} className="form-label">{etiqueta}</label>
      <div className="input-group">
        <span className="input-group-text"><Icono nombre="buscar" tamano={20} /></span>
        <input id={id} type="search" className="form-control" value={valor} placeholder={placeholder}
               autoComplete="off" onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}
