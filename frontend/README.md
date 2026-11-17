# Frontend – Mesa Abierta

Interfaz web responsive (PWA) en React + Vite, pensada para usarse desde el celular por personas con poca experiencia.

Navegación fija arriba, con íconos y texto:
- **Inicio**: resumen del día (menú, quién cocina, raciones, avisos) y primeros pasos guiados.
- **Raciones**: cantidad de raciones servidas por día y servicio (se puede cargar un día anterior).
- **Despensa** (Administrador y Responsable): existencias, alertas y donaciones.
- **Semana**: menús y turnos día por día (el Voluntario los ve en solo lectura).
- **Informes** (Administrador y Responsable): raciones, insumos y donaciones por período, con descarga a PDF y Excel.
- **Mi cuenta**: cambiar contraseña y tamaño de letra; el Administrador accede desde ahí a **Usuarios y roles**.

Cada pantalla trae una ayuda plegable "¿Cómo se usa?".

## Requisitos
Node.js 20 o más nuevo y la API del `backend/` en marcha (puerto 3000).

## Uso
```
npm install
npm run dev        # http://localhost:5173  (las llamadas a /api se redirigen al backend)
npm run build      # versión de producción en dist/
```
