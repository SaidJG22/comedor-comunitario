import { lazy, Suspense } from 'react';

// Carga diferida
const cargar = () => import('./Graficos.jsx');
const perezoso = (nombre) => lazy(() => cargar().then((m) => ({ default: m[nombre] })));

const Perezosos = {
  GraficoRaciones: perezoso('GraficoRaciones'),
  GraficoPlanVsServido: perezoso('GraficoPlanVsServido'),
  GraficoDonaciones: perezoso('GraficoDonaciones'),
  GraficoDespensa: perezoso('GraficoDespensa'),
};

const Espera = () => (
  <div className="grafico h-100">
    <div className="grafico-vacio" aria-live="polite">Cargando gráfico…</div>
  </div>
);

const conEspera = (Componente) =>
  function GraficoConEspera(props) {
    return (
      <Suspense fallback={<Espera />}>
        <Componente {...props} />
      </Suspense>
    );
  };

export const GraficoRaciones = conEspera(Perezosos.GraficoRaciones);
export const GraficoPlanVsServido = conEspera(Perezosos.GraficoPlanVsServido);
export const GraficoDonaciones = conEspera(Perezosos.GraficoDonaciones);
export const GraficoDespensa = conEspera(Perezosos.GraficoDespensa);
