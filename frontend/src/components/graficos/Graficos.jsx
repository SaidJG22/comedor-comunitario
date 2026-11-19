import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { colorCss, remEnPx } from '../../utils/css.js';
import { capitalizar, fechaLegible, num } from '../../utils/formato.js';

// Colores
const colores = () => ({
  acento: colorCss('--grafico-serie-1'),
  coral: colorCss('--grafico-serie-2'),
  neutro: colorCss('--grafico-neutro'),
  peligro: colorCss('--peligro'),
  grilla: colorCss('--grafico-grilla'),
  ejes: colorCss('--grafico-ejes'),
  cursor: colorCss('--grafico-cursor'),
  fondo: colorCss('--superficie'),
  serie: [1, 2, 3, 4, 5, 6].map((n) => colorCss(`--grafico-serie-${n}`)),
});

const diaMes = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const ejes = (c) => ({ tick: { fill: c.ejes, fontSize: 12 }, tickLine: false, axisLine: { stroke: c.grilla } });

/** Tarjeta */
function Tarjeta({ titulo, sub, vacio, tabla, crece = false, children }) {
  return (
    <figure className="grafico sin-margen h-100">
      <h3>{titulo}</h3>
      {sub && <p className="grafico-sub">{sub}</p>}
      {vacio ? (
        <div className="grafico-vacio">{vacio}</div>
      ) : (
        <>
          <div className={`grafico-lienzo${crece ? ' crece' : ''}`} aria-hidden="true">{children}</div>
          {/* Tabla oculta */}
          <div className="sr-only">
            <table>
              <caption>{titulo}</caption>
              <thead><tr>{tabla.columnas.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
              <tbody>{tabla.filas.map((f, i) => <tr key={i}>{f.map((v, j) => <td key={j}>{v}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </>
      )}
    </figure>
  );
}

/** Globo */
function Globo({ active, payload, label, titulo = (l) => l }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-grafico">
      <p className="tooltip-titulo">{titulo(label ?? payload[0].name)}</p>
      {payload.map((p) => (
        <p key={p.dataKey ?? p.name} className="serie">
          <svg className="muestra" viewBox="0 0 10 10" aria-hidden="true"><rect width="10" height="10" rx="3" fill={p.color ?? p.payload?.fill} /></svg>
          {p.name}: <strong>{num(p.value)}</strong>
        </p>
      ))}
    </div>
  );
}

const globoFecha = (props) => <Globo {...props} titulo={fechaLegible} />;

/** Raciones por día */
export function GraficoRaciones({ datos, titulo = 'Raciones servidas por día', sub }) {
  const c = colores();
  return (
    <Tarjeta
      titulo={titulo}
      sub={sub ?? 'Almuerzo y merienda de cada día.'}
      vacio={datos.length === 0 && 'Todavía no hay raciones cargadas en este período.'}
      tabla={{ columnas: ['Día', 'Almuerzo', 'Merienda'], filas: datos.map((d) => [fechaLegible(d.fecha), num(d.almuerzo), num(d.merienda)]) }}
    >
      <ResponsiveContainer>
        <BarChart data={datos} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={c.grilla} />
          <XAxis dataKey="fecha" tickFormatter={diaMes} {...ejes(c)} minTickGap={8} />
          <YAxis allowDecimals={false} {...ejes(c)} axisLine={false} width={48} />
          <Tooltip content={globoFecha} cursor={{ fill: c.cursor }} />
          <Legend iconType="circle" />
          <Bar dataKey="almuerzo" name="Almuerzo" stackId="r" fill={c.acento} maxBarSize={36} />
          <Bar dataKey="merienda" name="Merienda" stackId="r" fill={c.coral} maxBarSize={36} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Tarjeta>
  );
}

/** Planificado vs servido */
export function GraficoPlanVsServido({ datos }) {
  const c = colores();
  return (
    <Tarjeta
      titulo="Planificadas y servidas"
      vacio={datos.length === 0 && 'No hay menús ni raciones en este período.'}
      tabla={{ columnas: ['Día', 'Planificadas', 'Servidas'], filas: datos.map((d) => [fechaLegible(d.fecha), num(d.planificadas), num(d.servidas)]) }}
    >
      <ResponsiveContainer>
        <BarChart data={datos} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barGap={2}>
          <CartesianGrid vertical={false} stroke={c.grilla} />
          <XAxis dataKey="fecha" tickFormatter={diaMes} {...ejes(c)} minTickGap={8} />
          <YAxis allowDecimals={false} {...ejes(c)} axisLine={false} width={48} />
          <Tooltip content={globoFecha} cursor={{ fill: c.cursor }} />
          <Legend iconType="circle" />
          <Bar dataKey="planificadas" name="Planificadas" fill={c.neutro} maxBarSize={18} radius={[3, 3, 0, 0]} />
          <Bar dataKey="servidas" name="Servidas" fill={c.acento} maxBarSize={18} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Tarjeta>
  );
}

/** Donaciones por origen */
export function GraficoDonaciones({ datos }) {
  const c = colores();
  const total = datos.reduce((a, d) => a + Number(d.donaciones), 0);
  return (
    <Tarjeta
      titulo="Donaciones por origen"
      sub={total > 0 ? `${num(total)} ${total === 1 ? 'donación' : 'donaciones'} en el período.` : 'Quién donó en el período.'}
      vacio={datos.length === 0 && 'No hay donaciones registradas en este período.'}
      tabla={{ columnas: ['Origen', 'Donaciones'], filas: datos.map((d) => [d.origen, num(d.donaciones)]) }}
    >
      <ResponsiveContainer>
        <PieChart>
          <Pie data={datos} dataKey="donaciones" nameKey="origen" innerRadius="52%" outerRadius="80%" paddingAngle={datos.length > 1 ? 2 : 0} stroke={datos.length > 1 ? c.fondo : 'none'}>
            {datos.map((d, i) => <Cell key={d.origen} fill={c.serie[i % c.serie.length]} />)}
          </Pie>
          <Tooltip content={(props) => <Globo {...props} />} />
          <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </Tarjeta>
  );
}

/** Despensa por categoría */
export function GraficoDespensa({ datos }) {
  const c = colores();
  // Alto variable
  const alto = remEnPx(Math.max(15, 3 + datos.length * 2.4));
  return (
    <Tarjeta
      titulo="Despensa por categoría"
      vacio={datos.length === 0 && 'Todavía no hay productos cargados.'}
      tabla={{ columnas: ['Categoría', 'En orden', 'Bajo el mínimo'], filas: datos.map((d) => [d.categoria, num(d.enOrden), num(d.bajoMinimo)]) }}
      crece
    >
      <ResponsiveContainer height={alto}>
        <BarChart data={datos} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke={c.grilla} />
          <XAxis type="number" allowDecimals={false} {...ejes(c)} />
          <YAxis type="category" dataKey="categoria" {...ejes(c)} width={96} tickFormatter={capitalizar} />
          <Tooltip content={(props) => <Globo {...props} />} cursor={{ fill: c.cursor }} />
          <Legend iconType="circle" />
          <Bar dataKey="enOrden" name="En orden" stackId="d" fill={c.acento} maxBarSize={26} />
          <Bar dataKey="bajoMinimo" name="Bajo el mínimo" stackId="d" fill={c.peligro} maxBarSize={26} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Tarjeta>
  );
}
