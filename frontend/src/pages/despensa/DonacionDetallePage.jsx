import { useNavigate, useParams } from 'react-router-dom';
import { Cargando } from '../../components/Campos.jsx';
import EncabezadoPagina from '../../components/EncabezadoPagina.jsx';
import Icono from '../../components/Iconos.jsx';
import NoDisponible from '../../components/NoDisponible.jsx';
import { useCarga } from '../../hooks/useCarga.js';
import { cantidad, fechaCorta, fechaLegible } from '../../utils/formato.js';

/** Detalle de donación */
export default function DonacionDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const donacion = useCarga(`/donaciones/${id}`);
  const volver = () => navigate('/despensa/donaciones');

  if (!donacion.datos) return donacion.error ? <NoDisponible mensaje={donacion.error} volver={volver} /> : <Cargando />;
  const d = donacion.datos;
  const usada = d.items.some((i) => Number(i.usado) > 0);

  return (
    <div className="form-pagina">
      <EncabezadoPagina
        nivel={2}
        titulo={`Donación de ${d.origen}`}
        descripcion={`${fechaLegible(d.fecha)}${d.referencia ? ` · ${d.referencia}` : ''}`}
        accion={{ texto: 'Editar', icono: 'editar', onClick: () => navigate(`/despensa/donaciones/${id}/editar`) }}
      />
      <div className="tabla-scroll">
        <table className="table table-hover tabla">
          <thead>
            <tr><th scope="col">Producto</th><th scope="col" className="num">Llegó</th><th scope="col">Vence</th><th scope="col" className="num">Usado</th></tr>
          </thead>
          <tbody>
            {d.items.map((i) => (
              <tr key={i.id}>
                <td>{i.nombre}</td>
                <td className="num">{cantidad(i.cantidad, i.unidad)}</td>
                <td>{i.fecha_vencimiento ? fechaCorta(i.fecha_vencimiento) : '—'}</td>
                <td className="num">{Number(i.usado) > 0 ? cantidad(i.usado, i.unidad) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="tenue">
        {usada
          ? 'Parte de esta donación ya se usó: se pueden corregir quién donó, la referencia y la fecha.'
          : 'Todavía no se usó nada: se puede corregir todo o borrarla desde el listado.'}
      </p>
      <button type="button" className="btn btn-outline-secondary" onClick={volver}>
        <Icono nombre="atras" tamano={18} /> Volver a las donaciones
      </button>
    </div>
  );
}
