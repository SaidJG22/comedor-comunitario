import { useState } from 'react';
import Icono from './Iconos.jsx';

/** Foto de portada */
export default function Portada({ src, className = '', children }) {
  const [estado, setEstado] = useState('cargando'); // 'cargando' | 'con-foto' | 'falta'

  return (
    <div className={`portada ${className} ${estado}${children ? ' con-texto' : ''}`}>
      {estado !== 'falta' && (
        <img src={src} alt="" onLoad={() => setEstado('con-foto')} onError={() => setEstado('falta')} />
      )}
      {estado === 'falta' && (
        <span className="portada-hueco" title={`Poné una foto en frontend/public${src}`}>
          <Icono nombre="foto" tamano={18} /> Espacio para una foto
        </span>
      )}
      {children && <div className="portada-texto">{children}</div>}
    </div>
  );
}
