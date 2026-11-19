import { useId } from 'react';

/** Filtro por opciones */
export default function FiltroOpciones({ etiqueta, opciones, valor, onChange, extra }) {
  const id = useId();
  return (
    <div className="filtro">
      <div className="filtro-cabecera">
        <span id={id} className="form-label">{etiqueta}</span>
        {extra}
      </div>
      <div className="filtro-opciones" role="group" aria-labelledby={id}>
        {opciones.map((o) => {
          const elegida = o.valor === valor;
          return (
            <button key={o.valor} type="button" aria-pressed={elegida} onClick={() => onChange(o.valor)}
                    className={`btn btn-sm mini ${elegida ? 'btn-primary' : 'btn-outline-secondary'}`}>
              {o.texto}
              {o.cantidad !== undefined && <span className="filtro-cantidad">{o.cantidad}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
