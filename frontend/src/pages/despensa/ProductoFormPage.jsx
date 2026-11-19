import { useNavigate, useParams } from 'react-router-dom';
import { useAviso } from '../../components/Avisos.jsx';
import { Cargando } from '../../components/Campos.jsx';
import EncabezadoPagina from '../../components/EncabezadoPagina.jsx';
import NoDisponible from '../../components/NoDisponible.jsx';
import NuevoProducto from '../../components/NuevoProducto.jsx';
import { useCarga } from '../../hooks/useCarga.js';

/** Pantalla de producto */
export default function ProductoFormPage() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const avisar = useAviso();
  const producto = useCarga(editando ? `/stock/productos/${id}` : null);
  const volver = () => navigate('/despensa/existencias');

  function listo(mensaje) {
    avisar(mensaje);
    volver();
  }

  if (editando && !producto.datos) {
    return producto.error ? <NoDisponible mensaje={producto.error} volver={volver} /> : <Cargando />;
  }
  if (editando && !producto.datos.activo) {
    return <NoDisponible mensaje={`"${producto.datos.nombre}" está dado de baja y no se puede editar.`} volver={volver} />;
  }

  return (
    <div className="form-pagina">
      <EncabezadoPagina
        nivel={2}
        titulo={editando ? `Editar "${producto.datos.nombre}"` : 'Nuevo producto'}
        descripcion={editando ? 'Nombre, categoría y aviso de stock mínimo.' : 'Se carga una sola vez; después registrás lo que llega y lo que se usa.'}
      />
      <div className="panel">
        <NuevoProducto key={id ?? 'nuevo'} enPagina producto={producto.datos ?? undefined} onListo={listo} onCancelar={volver} />
      </div>
    </div>
  );
}
