import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, hoyLocal } from '../../api/client.js';
import AccionesFila from '../../components/AccionesFila.jsx';
import AyudaPlegable from '../../components/AyudaPlegable.jsx';
import { useAviso } from '../../components/Avisos.jsx';
import { Cargando, Entrada, Mensajes, Vacio } from '../../components/Campos.jsx';
import { useConfirmar } from '../../components/Confirmar.jsx';
import EncabezadoPagina from '../../components/EncabezadoPagina.jsx';
import { useCarga } from '../../hooks/useCarga.js';
import { textoError } from '../../utils/errores.js';
import { fechaCorta, mesDe, semanaDe } from '../../utils/formato.js';

export default function DonacionesPage() {
  const avisar = useAviso();
  const confirmar = useConfirmar();
  const navigate = useNavigate();
  const [rango, setRango] = useState(() => mesDe(hoyLocal()));
  const rangoValido = rango.desde && rango.hasta && rango.desde <= rango.hasta;
  const donaciones = useCarga(rangoValido ? `/donaciones?desde=${rango.desde}&hasta=${rango.hasta}` : null);
  const lista = donaciones.datos ?? [];

  const nueva = () => navigate('/despensa/donaciones/nueva');

  async function borrar(d) {
    const si = await confirmar({
      titulo: `¿Borrar la donación de ${d.origen} del ${fechaCorta(d.fecha)}?`,
      mensaje: 'Se van a restar de la despensa los productos que entraron con ella. No se puede deshacer.',
      textoSi: 'Sí, borrar',
      peligro: true,
    });
    if (!si) return;
    try {
      await api(`/donaciones/${d.id}`, { method: 'DELETE' });
      avisar('Se borró la donación y se restó de la despensa.');
      donaciones.recargar();
    } catch (err) {
      avisar(textoError(err), 'error');
    }
  }

  return (
    <div>
      <EncabezadoPagina
        nivel={2}
        titulo="Donaciones"
        descripcion="Lo que llega se suma a la despensa automáticamente."
        accion={{ texto: 'Registrar donación', icono: 'donacion', onClick: nueva }}
      />
      <AyudaPlegable>
        <ol>
          <li>Tocá <strong>Registrar donación</strong> y elegí quién donó (Estado, Banco de Alimentos, un particular o un comercio).</li>
          <li>Elegí el producto y escribí cuánto llegó. Si no está en la lista, agregalo desde el mismo formulario.</li>
          <li>Tocá una donación para ver qué llegó. ¿Te equivocaste? <strong>Editar</strong> la corrige y <strong>Borrar</strong> la quita: la despensa se ajusta sola.</li>
          <li>Si parte de la donación ya se usó, solo se corrigen quién donó, la referencia y la fecha. Las cantidades se corrigen con “Corrección” en <strong>Lo que hay</strong>.</li>
        </ol>
      </AyudaPlegable>

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
      {!rangoValido && <Mensajes error="Elegí un período válido: “Desde” no puede ser posterior a “Hasta”." />}
      <Mensajes error={donaciones.error} />
      {donaciones.cargando && !donaciones.datos && <Cargando />}

      {rangoValido && donaciones.datos && (
        <p className="tenue">
          {lista.length === 0 ? 'Sin donaciones' : `${lista.length} ${lista.length === 1 ? 'donación' : 'donaciones'}`} entre el{' '}
          {fechaCorta(rango.desde)} y el {fechaCorta(rango.hasta)}.
        </p>
      )}
      <ul className="lista">
        {lista.map((d) => (
          <li key={d.id} className="fila">
            <div className="fila-info">
              <Link to={`/despensa/donaciones/${d.id}`} className="fila-titulo fila-enlace">
                {d.origen}
                {Boolean(d.usada) && <span className="badge rounded-pill insignia neutra">Ya se usó en parte</span>}
              </Link>
              <span className="fila-detalle">
                {fechaCorta(d.fecha)}
                {d.referencia ? ` · ${d.referencia}` : ''}
              </span>
            </div>
            <span className="badge rounded-pill insignia info">
              {d.cantidad_items} {Number(d.cantidad_items) === 1 ? 'producto' : 'productos'}
            </span>
            <AccionesFila
              acciones={[
                { texto: 'Editar', icono: 'editar', etiqueta: `Editar la donación de ${d.origen} del ${fechaCorta(d.fecha)}`, onClick: () => navigate(`/despensa/donaciones/${d.id}/editar`) },
                !d.usada && { texto: 'Borrar', icono: 'borrar', peligro: true, etiqueta: `Borrar la donación de ${d.origen} del ${fechaCorta(d.fecha)}`, onClick: () => borrar(d) },
              ]}
            />
          </li>
        ))}
      </ul>
      {rangoValido && !donaciones.cargando && !donaciones.error && lista.length === 0 && (
        <Vacio icono="donacion" accion={{ texto: 'Registrar donación', onClick: nueva }}>
          No hay donaciones registradas en este período.
        </Vacio>
      )}
    </div>
  );
}
