import { Card } from 'react-bootstrap'
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

// Colores
const AZUL = '#4c6fd6'
const CORAL = '#e76f51'
const GRIS = '#8b95a5'
const ROJO = '#e5534b'
const COLORES = [AZUL, CORAL, '#2fa36b', '#d6a23a', GRIS, '#9b6fd6']

const diaMes = (fecha) => `${fecha.slice(8, 10)}/${fecha.slice(5, 7)}`

// Tarjeta del gráfico
const Tarjeta = ({ titulo, vacio, children }) => {
  return (
    <Card className="h-100 grafico">
      <Card.Body>
        <Card.Title as="h2" className="h6">{titulo}</Card.Title>
        {vacio ? (
          <p className="grafico-vacio">Todavía no hay datos en este período.</p>
        ) : (
          <div className="grafico-lienzo">
            <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

export const GraficoRaciones = ({ datos, titulo = 'Raciones servidas por día' }) => {
  return (
    <Tarjeta titulo={titulo} vacio={datos.length === 0}>
      <BarChart data={datos}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="fecha" tickFormatter={diaMes} />
        <YAxis allowDecimals={false} />
        <Tooltip labelFormatter={diaMes} />
        <Legend />
        <Bar dataKey="almuerzo" name="Almuerzo" stackId="a" fill={AZUL} />
        <Bar dataKey="merienda" name="Merienda" stackId="a" fill={CORAL} />
      </BarChart>
    </Tarjeta>
  )
}

export const GraficoPlanVsServido = ({ datos }) => {
  return (
    <Tarjeta titulo="Raciones planificadas y servidas" vacio={datos.length === 0}>
      <BarChart data={datos}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="fecha" tickFormatter={diaMes} />
        <YAxis allowDecimals={false} />
        <Tooltip labelFormatter={diaMes} />
        <Legend />
        <Bar dataKey="planificadas" name="Planificadas" fill={GRIS} />
        <Bar dataKey="servidas" name="Servidas" fill={AZUL} />
      </BarChart>
    </Tarjeta>
  )
}

export const GraficoDonaciones = ({ datos }) => {
  // Mismo orden que la leyenda
  const ordenados = [...datos].sort((a, b) => a.origen.localeCompare(b.origen))

  return (
    <Tarjeta titulo="Donaciones según quién donó" vacio={datos.length === 0}>
      <PieChart>
        <Pie data={ordenados} dataKey="donaciones" nameKey="origen" innerRadius="45%" outerRadius="80%" label isAnimationActive={false}>
          {ordenados.map((d, i) => (
            <Cell key={d.origen} fill={COLORES[i % COLORES.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </Tarjeta>
  )
}

export const GraficoDespensa = ({ datos }) => {
  return (
    <Tarjeta titulo="Productos por categoría" vacio={datos.length === 0}>
      <BarChart data={datos}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="categoria" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="enOrden" name="En orden" stackId="a" fill={AZUL} />
        <Bar dataKey="bajoMinimo" name="Bajo el mínimo" stackId="a" fill={ROJO} />
      </BarChart>
    </Tarjeta>
  )
}
