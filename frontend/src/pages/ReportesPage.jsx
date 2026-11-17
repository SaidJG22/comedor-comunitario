import { useMemo, useState } from 'react';
import { hoyLocal } from '../api/client.js';
import AyudaPlegable from '../components/AyudaPlegable.jsx';
import { Cargando, Entrada, Mensajes, Vacio } from '../components/Campos.jsx';
import Selector from '../components/Selector.jsx';
import { useCarga } from '../hooks/useCarga.js';
import { exportarExcel, exportarPDF } from '../utils/exportar.js';
import { capitalizar, fechaCorta, mesDe, num, semanaDe } from '../utils/formato.js';

// Solo datos agregados: ningún reporte identifica personas asistidas.
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

export default function ReportesPage() {
  const [tipo, setTipo] = useState('raciones');
  const [rango, setRango] = useState(() => mesDe(hoyLocal()));
  const [mensaje, setMensaje] = useState({ error: '', ok: '' });
  const [exportando, setExportando] = useState(false);

  const def = REPORTES[tipo];
  const rangoValido = rango.desde && rango.hasta && rango.desde <= rango.hasta;
  const datos = useCarga(rangoValido ? `/reportes/${def.ruta}?desde=${rango.desde}&hasta=${rango.hasta}` : null);

  const filas = useMemo(() => (datos.datos ?? []).map(def.fila), [datos.datos, def]);
  const total = def.totalEn === undefined ? null : filas.reduce((acc, f) => acc + f[def.totalEn], 0);

  async function exportar(formato) {
    setMensaje({ error: '', ok: '' });
    setExportando(true);
    const reporte = { base: `reporte-${def.ruta}`, titulo: def.titulo, ...rango, columnas: def.columnas, filas };
    try {
      await (formato === 'pdf' ? exportarPDF(reporte) : exportarExcel(reporte));
      setMensaje({ error: '', ok: `Se descargó el archivo ${formato === 'pdf' ? 'PDF' : 'Excel'}.` });
    } catch {
      setMensaje({ error: 'No se pudo generar el archivo. Intentá de nuevo.', ok: '' });
    } finally {
      setExportando(false);
    }
  }

  return (
    <section>
      <h1>Informes</h1>
      <p className="sub">Totales para rendir cuentas. No incluyen datos de personas.</p>
      <AyudaPlegable>
        <ol>
          <li>Elegí qué informe querés ver: raciones servidas, insumos usados o donaciones recibidas.</li>
          <li>Elegí el período con “Desde” y “Hasta”, o tocá “Esta semana” o “Este mes”.</li>
          <li>Para guardarlo o mandarlo, tocá <strong>Descargar PDF</strong> o <strong>Descargar Excel</strong>.</li>
        </ol>
      </AyudaPlegable>

      <Selector etiqueta="Tipo de reporte" opciones={OPCIONES} valor={tipo} onChange={(t) => { setTipo(t); setMensaje({ error: '', ok: '' }); }} />

      <div className="rango">
        <Entrada label="Desde" type="date" value={rango.desde} onChange={(e) => setRango({ ...rango, desde: e.target.value })} />
        <Entrada label="Hasta" type="date" value={rango.hasta} onChange={(e) => setRango({ ...rango, hasta: e.target.value })} />
      </div>
      <div className="atajos">
        <button type="button" className="btn-sec" onClick={() => setRango(semanaDe(hoyLocal()))}>Esta semana</button>
        <button type="button" className="btn-sec" onClick={() => setRango(mesDe(hoyLocal()))}>Este mes</button>
      </div>

      {!rangoValido && <Mensajes error="Elegí un período válido: la fecha “Desde” no puede ser posterior a “Hasta”." />}
      <Mensajes error={datos.error || mensaje.error} ok={mensaje.ok} />
      {datos.cargando && <Cargando />}

      {rangoValido && !datos.cargando && !datos.error && (
        <>
          <h2 className="seccion">
            {def.titulo} · {fechaCorta(rango.desde)} al {fechaCorta(rango.hasta)}
          </h2>
          {filas.length === 0 ? (
            <Vacio>No hay datos en este período.</Vacio>
          ) : (
            <>
              <div className="tabla-scroll">
                <table className="tabla">
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
                <button type="button" className="btn" disabled={exportando} onClick={() => exportar('pdf')}>Descargar PDF</button>
                <button type="button" className="btn" disabled={exportando} onClick={() => exportar('xlsx')}>Descargar Excel</button>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
