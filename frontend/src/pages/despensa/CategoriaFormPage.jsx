import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAviso } from '../../components/Avisos.jsx';
import { Cargando, Entrada, Mensajes } from '../../components/Campos.jsx';
import EncabezadoPagina from '../../components/EncabezadoPagina.jsx';
import NoDisponible from '../../components/NoDisponible.jsx';
import { useCarga } from '../../hooks/useCarga.js';
import { textoError } from '../../utils/errores.js';

function FormCategoria({ categoria, onListo, onCancelar }) {
  const editando = Boolean(categoria);
  const [nombre, setNombre] = useState(categoria?.nombre ?? '');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    const limpio = nombre.trim();
    try {
      if (editando) {
        await api(`/stock/categorias/${categoria.id}`, { method: 'PUT', body: { nombre: limpio } });
        onListo(`Se guardó la categoría "${limpio}".`);
      } else {
        await api('/stock/categorias', { method: 'POST', body: { nombre: limpio } });
        onListo(`Se agregó la categoría "${limpio}".`);
      }
    } catch (err) {
      setError(textoError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} aria-label={editando ? 'Editar categoría' : 'Nueva categoría'}>
      <Entrada label="Nombre" required maxLength={50} value={nombre} placeholder="Ej.: Bebidas"
               ayuda="Aparece en el filtro de la despensa y al cargar un producto."
               onChange={(e) => setNombre(e.target.value)} />
      <Mensajes error={error} />
      <div className="modal-pie">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={enviando}>{enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Agregar categoría'}</button>
      </div>
    </form>
  );
}

/** Formulario de categoría */
export default function CategoriaFormPage() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const avisar = useAviso();
  const categoria = useCarga(editando ? `/stock/categorias/${id}` : null);
  const volver = () => navigate('/despensa/categorias');

  if (editando && !categoria.datos) {
    return categoria.error ? <NoDisponible mensaje={categoria.error} volver={volver} /> : <Cargando />;
  }

  return (
    <div className="form-pagina">
      <EncabezadoPagina
        nivel={2}
        titulo={editando ? `Editar "${categoria.datos.nombre}"` : 'Nueva categoría'}
        descripcion="Por ejemplo: Secos, Frescos, Lácteos o Limpieza."
      />
      <div className="panel">
        <FormCategoria key={id ?? 'nueva'} categoria={categoria.datos ?? undefined}
                       onListo={(mensaje) => { avisar(mensaje); volver(); }} onCancelar={volver} />
      </div>
    </div>
  );
}
