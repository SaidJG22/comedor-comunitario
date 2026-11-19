import { useNavigate, useParams } from 'react-router-dom';
import { GESTION } from '../../auth/roles.js';
import { useSesion } from '../../store/sesion.js';
import { Cargando, Vacio } from '../../components/Campos.jsx';
import EncabezadoPagina from '../../components/EncabezadoPagina.jsx';
import Icono from '../../components/Iconos.jsx';
import NoDisponible from '../../components/NoDisponible.jsx';
import { useCarga } from '../../hooks/useCarga.js';
import { capitalizar, cantidad, fechaLegible } from '../../utils/formato.js';

const porRacion = (n) => Number(n).toLocaleString('es-AR', { maximumFractionDigits: 4 });

/** Detalle de menú */
export default function MenuDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useSesion();
  const gestion = GESTION.includes(usuario.rol);
  const menu = useCarga(`/menus/${id}`);

  if (!menu.datos) {
    return menu.error ? <NoDisponible mensaje={menu.error} volver={() => navigate('/semana')} textoVolver="Volver a la semana" /> : <Cargando />;
  }
  const m = menu.datos;
  const volver = () => navigate(`/semana?fecha=${m.fecha}`);

  return (
    <div className="form-pagina">
      <EncabezadoPagina
        nivel={2}
        titulo={m.nombre_plato}
        descripcion={`${fechaLegible(m.fecha)} · ${capitalizar(m.servicio)} · ${m.raciones_planificadas} raciones`}
        accion={gestion && m.estado === 'planificado' ? { texto: 'Editar', icono: 'editar', onClick: () => navigate(`/semana/menus/${id}/editar`) } : undefined}
      />
      <p>
        <span className={`badge rounded-pill insignia ${m.estado}`}>
          {m.estado === 'confirmado' ? 'Confirmado: ya descontó la despensa' : 'Planificado: todavía no descontó la despensa'}
        </span>
      </p>
      {m.insumos.length === 0 ? (
        <Vacio icono="despensa">Este menú no tiene ingredientes cargados.</Vacio>
      ) : (
        <div className="tabla-scroll">
          <table className="table table-hover tabla">
            <thead>
              <tr><th scope="col">Ingrediente</th><th scope="col" className="num">En total</th><th scope="col" className="num">Por ración</th></tr>
            </thead>
            <tbody>
              {m.insumos.map((i) => (
                <tr key={i.producto_id}>
                  <td>{i.nombre}</td>
                  <td className="num">{cantidad(i.cantidad_total, i.unidad)}</td>
                  <td className="num">{porRacion(i.cantidad_por_racion)} {i.unidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button type="button" className="btn btn-outline-secondary" onClick={volver}>
        <Icono nombre="atras" tamano={18} /> Volver a la semana
      </button>
    </div>
  );
}
