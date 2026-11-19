import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';
import AccionesFila from '../../components/AccionesFila.jsx';
import AyudaPlegable from '../../components/AyudaPlegable.jsx';
import { useAviso } from '../../components/Avisos.jsx';
import { Cargando, Mensajes, Vacio } from '../../components/Campos.jsx';
import { useConfirmar } from '../../components/Confirmar.jsx';
import EncabezadoPagina from '../../components/EncabezadoPagina.jsx';
import Icono from '../../components/Iconos.jsx';
import { useCarga } from '../../hooks/useCarga.js';
import { textoError } from '../../utils/errores.js';

const productos = (n) => (n === 0 ? 'Sin productos' : `${n} ${n === 1 ? 'producto' : 'productos'}`);

/** Categorías */
export default function CategoriasPage() {
  const categorias = useCarga('/stock/categorias');
  const avisar = useAviso();
  const confirmar = useConfirmar();
  const navigate = useNavigate();
  const lista = categorias.datos ?? [];
  const nueva = () => navigate('/despensa/categorias/nueva');

  // Borrar categoría
  async function borrar(c) {
    const n = Number(c.productos);
    const si = await confirmar({
      titulo: `¿Borrar la categoría "${c.nombre}"?`,
      mensaje: n > 0
        ? `${n === 1 ? 'El producto' : `Los ${n} productos`} de "${c.nombre}" ${n === 1 ? 'va' : 'van'} a quedar "Sin categoría". No se borra ningún producto.`
        : 'No tiene productos.',
      textoSi: 'Sí, borrar',
      peligro: true,
    });
    if (!si) return;
    try {
      await api(`/stock/categorias/${c.id}`, { method: 'DELETE' });
      avisar(`Se borró la categoría "${c.nombre}".`);
      categorias.recargar();
    } catch (err) {
      avisar(textoError(err), 'error');
    }
  }

  return (
    <div>
      <EncabezadoPagina
        nivel={2}
        titulo="Categorías"
        descripcion={categorias.datos ? `${lista.length} ${lista.length === 1 ? 'categoría' : 'categorías'}` : undefined}
        accion={{ texto: 'Nueva categoría', onClick: nueva }}
      />
      <AyudaPlegable>
        <ol>
          <li>Las categorías ordenan la despensa (Secos, Frescos, Lácteos…): aparecen en el filtro de <strong>Lo que hay</strong> y en los informes.</li>
          <li>Con <strong>Nueva categoría</strong> agregás una; después la elegís al crear o editar un producto.</li>
          <li><strong>Borrar</strong> no borra productos: los que tenía quedan como “Sin categoría”.</li>
        </ol>
      </AyudaPlegable>
      <Mensajes error={categorias.error} />
      {categorias.cargando && !categorias.datos && <Cargando />}

      {lista.length > 0 && (
        <ul className="lista">
          {lista.map((c) => (
            <li key={c.id} className="fila">
              <div className="fila-info">
                <span className="fila-titulo">{c.nombre}</span>
                <span className="fila-detalle">{productos(Number(c.productos))}</span>
              </div>
              <AccionesFila
                acciones={[
                  { texto: 'Editar', icono: 'editar', etiqueta: `Editar la categoría ${c.nombre}`, onClick: () => navigate(`/despensa/categorias/${c.id}/editar`) },
                  { texto: 'Borrar', icono: 'borrar', peligro: true, etiqueta: `Borrar la categoría ${c.nombre}`, onClick: () => borrar(c) },
                ]}
              />
            </li>
          ))}
        </ul>
      )}
      {categorias.datos && lista.length === 0 && (
        <Vacio icono="categoria" accion={{ texto: 'Nueva categoría', onClick: nueva }}>
          Todavía no hay categorías.
        </Vacio>
      )}

      <button type="button" className="btn btn-outline-secondary separado" onClick={() => navigate('/despensa/existencias')}>
        <Icono nombre="atras" tamano={18} /> Volver a la despensa
      </button>
    </div>
  );
}
