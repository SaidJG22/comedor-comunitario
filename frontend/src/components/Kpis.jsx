import { Link } from 'react-router-dom';
import Icono from './Iconos.jsx';
import { num } from '../utils/formato.js';

/** Números del tablero */
export default function Kpis({ kpis, periodo = 'en el período' }) {
  const alertas = kpis.stockBajo + kpis.porVencer;
  return (
    <div className="row g-3 mb-3" role="list" aria-label="Resumen en números">
      <div className="col-6 col-lg-3" role="listitem">
        <div className="kpi h-100">
          <span className="kpi-etiqueta"><Icono nombre="raciones" tamano={16} /> Raciones servidas</span>
          <span className="kpi-valor">{num(kpis.raciones)}</span>
          <span className="kpi-nota">{periodo}</span>
        </div>
      </div>
      <div className="col-6 col-lg-3" role="listitem">
        <div className="kpi h-100">
          <span className="kpi-etiqueta"><Icono nombre="grafico" tamano={16} /> Promedio por día</span>
          <span className="kpi-valor">{num(kpis.promedioDiario)}</span>
          <span className="kpi-nota">
            en {kpis.diasConRegistro} {kpis.diasConRegistro === 1 ? 'día' : 'días'} con registro
          </span>
        </div>
      </div>
      <div className="col-6 col-lg-3" role="listitem">
        <div className="kpi h-100">
          <span className="kpi-etiqueta"><Icono nombre="donacion" tamano={16} /> Donaciones</span>
          <span className="kpi-valor">{num(kpis.donaciones)}</span>
          <span className="kpi-nota">recibidas {periodo}</span>
        </div>
      </div>
      <div className="col-6 col-lg-3" role="listitem">
        <Link to="/despensa/existencias" className={`kpi h-100${alertas > 0 ? ' alerta' : ''}`}>
          <span className="kpi-etiqueta"><Icono nombre="alerta" tamano={16} /> Alertas de despensa</span>
          <span className="kpi-valor">{num(alertas)}</span>
          <span className="kpi-nota">{kpis.stockBajo} con poco stock · {kpis.porVencer} por vencer (hoy)</span>
        </Link>
      </div>
    </div>
  );
}
