import { useMemo, useState } from 'react';
import { hoyLocal } from '../../api/client.js';
import AyudaPlegable from '../../components/AyudaPlegable.jsx';
import { useAviso } from '../../components/Avisos.jsx';
import { Cargando, Entrada, Mensajes, Vacio } from '../../components/Campos.jsx';
import { GraficoDespensa, GraficoDonaciones, GraficoPlanVsServido, GraficoRaciones } from '../../components/graficos/index.jsx';
import Icono from '../../components/Iconos.jsx';
import Kpis from '../../components/Kpis.jsx';
import Selector from '../../components/Selector.jsx';
import { useCarga } from '../../hooks/useCarga.js';
import { exportarExcel, exportarPDF } from '../../utils/exportar.js';
import { capitalizar, fechaCorta, mesDe, num, semanaDe } from '../../utils/formato.js';

// Solo datos agregados
const REPORTES = {
  raciones: {
    titulo: 'Raciones servidas',
    ruta: 'raciones',
    columnas: ['Servicio', 'Raciones servidas', 'Días con registro'],
    fila: (r) => [capitalizar(r.servicio), Number(r.total_raciones), Number(r.dias_registrados)],
    totalEn: 1,
  },
  consumo: {
    titulo: 'Consumo de insumos',
    ruta: 'consumo-insumos',
    columnas: ['Producto', 'Unidad', 'Cantidad usada'],
    fila: (r) => [r.nombre, r.unidad, Number(r.total_consumido)],
  },
  donaciones: {
    titulo: 'Donaciones recibidas',
    ruta: 'donaciones',
    columnas: ['Origen', 'Producto', 'Unidad', 'Cantidad recibida'],
    fila: (r) => [r.origen, r.producto, r.unidad, Number(r.cantidad_total)],
  },
};

const OPCIONES = Object.entries(REPORTES).map(([valor, r]) => ({ valor, texto: r.titulo }));
const VISTAS = [
  { valor: 'graficos', texto: 'Gráficos' },
  { valor: 'tablas', texto: 'Tablas para descargar' },
];

/** Gráficos */
function VistaGraficos({ rango }) {
  const tablero = useCarga(`/reportes/tablero?desde=${rango.desde}&hasta=${rango.hasta}`);
  if (tablero.cargando && !tablero.datos) return <Cargando />;
  if (tablero.error) return <Mensajes error={tablero.error} />;
  if (!tablero.datos) return null;
  const t = tablero.datos;
  return (
    <>
      <Kpis kpis={t.kpis} />
      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-6"><GraficoRaciones datos={t.racionesPorDia} /></div>
        <div className="col-12 col-lg-6"><GraficoPlanVsServido datos={t.planificadasVsServidas} /></div>
        <div className="col-12 col-lg-6"><GraficoDonaciones datos={t.donacionesPorOrigen} /></div>
        <div className="col-12 col-lg-6"><GraficoDespensa datos={t.despensaPorCategoria} /></div>
      </div>
    </>
  );
}

/** Tablas */
function VistaTablas({ rango }) {
  const avisar = useAviso();
  const [tipo, setTipo] = useState('raciones');
  const [exportando, setExportando] = useState(false);

  const def = REPORTES[tipo];
  const datos = useCarga(`/reportes/${def.ruta}?desde=${rango.desde}&hasta=${rango.hasta}`);
  const filas = useMemo(() => (datos.datos ?? []).map(def.fila), [datos.datos, def]);
  const total = def.totalEn === undefined ? null : filas.reduce((acc, f) => acc + f[def.totalEn], 0);

  async function exportar(formato) {
    setExportando(true);
    const reporte = { base: `reporte-${def.ruta}`, titulo: def.titulo, ...rango, columnas: def.columnas, filas };
    try {
      await (formato === 'pdf' ? exportarPDF(reporte) : exportarExcel(reporte));
      avisar(`Se descargó el archivo ${formato === 'pdf' ? 'PDF' : 'Excel'}.`);
    } catch {
      avisar('No se pudo generar el archivo. Intentá de nuevo.', 'error');
    } finally {
      setExportando(false);
    }
  }

  return (
    <>
      <Selector etiqueta="Tipo de reporte" opciones={OPCIONES} valor={tipo} onChange={setTipo} />
      <Mensajes error={datos.error} />
      {datos.cargando && !datos.datos && <Cargando />}
      {!datos.error && datos.datos && (
        <>
          <h2 className="seccion">
            {def.titulo} · {fechaCorta(rango.desde)} al {fechaCorta(rango.hasta)}
          </h2>
          {filas.length === 0 ? (
            <Vacio icono="informes">No hay datos en este período.</Vacio>
          ) : (
            <>
              <div className="tabla-scroll">
                <table className="table table-hover tabla">
                  <thead>
                    <tr>{def.columnas.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filas.map((f, i) => (
                      <tr key={i}>{f.map((v, j) => <td key={j} className={typeof v === 'number' ? 'num' : ''}>{typeof v === 'number' ? num(v) : v}</td>)}</tr>
                    ))}
                  </tbody>
                  {total !== null && (
                    <tfoot>
                      <tr>
                        <th scope="row">Total</th>
                        <td className="num">{num(total)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
              <div className="atajos">
                <button type="button" className="btn btn-primary" disabled={exportando} onClick={() => exportar('pdf')}>Descargar PDF</button>
                <button type="button" className="btn btn-primary" disabled={exportando} onClick={() => exportar('xlsx')}>Descargar Excel</button>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

export default function InformesPage() {
  const [vista, setVista] = useState('graficos');
  const [rango, setRango] = useState(() => mesDe(hoyLocal()));
  const rangoValido = rango.desde && rango.hasta && rango.desde <= rango.hasta;

  return (
    <section>
      <h1>Informes</h1>
      <p className="sub">Métricas y totales para rendir cuentas. No incluyen datos de personas.</p>
      <AyudaPlegable>
        <ol>
          <li>Elegí el período con “Desde” y “Hasta”, o tocá “Esta semana” o “Este mes”.</li>
          <li>En <strong>Gráficos</strong> ves cómo viene el comedor: raciones por día, lo planificado contra lo servido, donaciones y despensa.</li>
          <li>En <strong>Tablas para descargar</strong> elegís un informe y lo bajás en <strong>PDF</strong> o <strong>Excel</strong> para guardarlo o mandarlo.</li>
        </ol>
      </AyudaPlegable>

      <Selector etiqueta="Vista" opciones={VISTAS} valor={vista} onChange={setVista} />

      <div className="filtros">
        <div className="row g-3 align-items-end">
          <div className="col-6 col-lg">
            <Entrada label="Desde" type="date" value={rango.desde} onChange={(e) => setRango({ ...rango, desde: e.target.value })} />
          </div>
          <div className="col-6 col-lg">
            <Entrada label="Hasta" type="date" value={rango.hasta} onChange={(e) => setRango({ ...rango, hasta: e.target.value })} />
          </div>
          <div className="col-12 col-lg-auto atajos">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setRango(semanaDe(hoyLocal()))}>Esta semana</button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setRango(mesDe(hoyLocal()))}>Este mes</button>
          </div>
        </div>
      </div>

      {!rangoValido && (
        <p role="alert" className="alert alert-warning aviso"><Icono nombre="alerta" tamano={18} /> Elegí un período válido: “Desde” no puede ser posterior a “Hasta”.</p>
      )}
      {rangoValido && (vista === 'graficos' ? <VistaGraficos rango={rango} /> : <VistaTablas rango={rango} />)}
    </section>
  );
}
