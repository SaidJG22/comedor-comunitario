# Frontend – ComeTUC

Interfaz web responsive (PWA) en React + Vite, pensada para usarse desde el celular por personas con poca experiencia.

**Públicas:** `/login` (ingresar) y `/registro` (crear una cuenta, que queda pendiente hasta que el Administrador la active). Comparten la pantalla con la foto (`layout/IngresoLayout.jsx`).

Navegación fija arriba, con íconos y texto:
- **Inicio**: foto de portada, números del mes y gráfico de raciones (Administrador y Responsable), resumen del día (menú, quién cocina, raciones) y primeros pasos guiados.
- **Raciones**: cantidad de raciones servidas por día y servicio (se puede cargar un día anterior). Gestión puede borrar un registro cargado por error.
- **Despensa** (Administrador y Responsable): productos (alta, edición y baja, con buscador y filtro por categoría), movimientos, alertas y donaciones (con su detalle). El Administrador además agrega, edita y borra categorías ("Editar categorías").
- **Semana**: pestaña **Menús** (menús y turnos día por día, con detalle de cada menú) y pestaña **Equipo** (voluntarios). El Voluntario ve los menús en solo lectura.
- **Informes** (Administrador y Responsable): gráficos del período (Recharts) y tablas de raciones, insumos y donaciones con descarga a PDF y Excel.
- **Mi cuenta**: cambiar la contraseña; el Administrador accede desde ahí a **Usuarios y roles**.

Cada alta y edición es una pantalla con su propia dirección (`useParams` + `useNavigate`); lo que borra o da de baja pide confirmación:

| Entidad | Listado | Crear | Editar | Detalle |
|---|---|---|---|---|
| Producto | `/despensa/existencias` | `/despensa/existencias/nuevo` | `/despensa/existencias/:id/editar` | — |
| Categoría (solo Administrador) | `/despensa/categorias` | `/despensa/categorias/nueva` | `/despensa/categorias/:id/editar` | — |
| Donación | `/despensa/donaciones` | `/despensa/donaciones/nueva` | `/despensa/donaciones/:id/editar` | `/despensa/donaciones/:id` |
| Menú | `/semana` | `/semana/menus/nuevo` | `/semana/menus/:id/editar` | `/semana/menus/:id` |
| Voluntario | `/semana/equipo` | `/semana/equipo/nuevo` | `/semana/equipo/:id/editar` | — |
| Usuario | `/usuarios` | `/usuarios/nuevo` | `/usuarios/:id/editar` | — |

La sesión (usuario, ingreso y salida) vive en un store de **Zustand**: `src/store/sesion.js`.

Cada pantalla trae una ayuda plegable "¿Cómo se usa?".

## Organización del código
```
src/
├── main.jsx · App.jsx    arranque y rutas
├── pages/                una carpeta por sección
│   ├── login/            LoginPage
│   ├── registro/         RegistroPage
│   ├── inicio/           InicioPage
│   ├── raciones/         RacionesPage
│   ├── despensa/         DespensaLayout, ExistenciasPage, ProductoFormPage, CategoriasPage, CategoriaFormPage,
│   │                     DonacionesPage, DonacionFormPage, DonacionDetallePage
│   ├── semana/           SemanaLayout, SemanaPage, MenuFormPage, MenuDetallePage, VoluntariosPage, VoluntarioFormPage
│   ├── informes/         InformesPage
│   ├── usuarios/         UsuariosPage, UsuarioFormPage, ContrasenaPage
│   └── cuenta/           CuentaPage
├── components/           piezas reutilizables (campos, ventana, confirmación, avisos, gráficos…)
├── layout/               AppShell: cabecera y contenido
├── css/                  todos los estilos (ver abajo)
├── api/ · auth/ · store/ · hooks/ · utils/
```

## Estilos (`src/css/`)
**Bootstrap 5.3** (solo el CSS) se importa primero en `src/main.jsx`, y después `css/index.css`, que carga el resto en orden.
**Ningún `.jsx` ni `.js` tiene estilos escritos**: todo el CSS está en esta carpeta.

| Archivo | Qué tiene |
|---|---|
| `variables.css` | Colores, espacios y bordes, más las variables de Bootstrap (`--bs-*`) y la paleta de los gráficos (`--grafico-*`). |
| `base.css` | Página, títulos, textos de ayuda, foco con teclado y animaciones. |
| `layout.css` | Cabecera (marca, secciones y cuenta) y contenido. |
| `componentes/` | Botones, formularios, contenedores, listas, pestañas, ventana, avisos, etiquetas, tablas, gráficos y portada. |
| `paginas/` | Lo propio de una pantalla: login, inicio, semana, raciones y cuenta. |

- **Colores:** salen de `variables.css`. Los gráficos de Recharts y el PDF los leen con `utils/css.js` (`colorCss('--acento')`), así hay un solo lugar para cambiarlos.
- **Clases de Bootstrap que se usan:**
  - la grilla (`row g-3` + `col-*`);
  - los botones (`btn btn-primary`, `btn-outline-secondary`, `btn-danger`, `btn-sm`);
  - los campos (`form-control`, `form-select`, `form-label`, `form-text`);
  - las tablas (`table table-hover`);
  - las etiquetas (`badge rounded-pill`);
  - los avisos (`alert alert-warning`).
- **La ventana propia** se llama `.ventana` (no `.modal`), para no chocar con la de Bootstrap.

## Logo y fotos
El sistema lleva el nombre del comedor, **ComeTUC**, y usa su logo.
El original (`logo.jpg`, 1,8 MB) no va en el repositorio: se guarda aparte, en la carpeta de la presentación (`originales/`). De ahí salen versiones livianas, que son las que usa la app:

| Archivo | Dónde aparece |
|---|---|
| `imagenes/logo-simbolo.jpg` y `imagenes/logo-nombre.jpg` | Barra de arriba (dibujo + nombre) |
| `imagenes/logo-completo.jpg` | Pantalla de ingreso, arriba del formulario |
| `icon-192.png` y `icon-512.png` | Ícono de la pestaña y de la app instalada en el celular |

Si cambia el logo, hay que volver a generar esas versiones (no conviene publicar el original de 1,8 MB).

Las fotos del comedor se ponen en `public/imagenes/` con estos nombres exactos:

| Archivo | Dónde aparece | Tamaño sugerido |
|---|---|---|
| `portada.jpg` | Pantalla de ingreso (mitad izquierda en la computadora, arriba en el celular) | 1200 × 1400 px, vertical |
| `inicio.jpg` | Banner de arriba de Inicio | 1600 × 500 px, horizontal |

Mientras no estén, se ve un fondo de color con el aviso "Espacio para una foto". Para cambiar una foto
alcanza con reemplazar el archivo (no pasa por la base de datos). Conviene que pesen menos de 300 KB.
No uses fotos donde se pueda reconocer a las personas que asisten al comedor.

## Requisitos
Node.js 20 o más nuevo y la API del `backend/` en marcha (puerto 3000).

## Uso
```
npm install
npm run dev        # http://localhost:5173  (las llamadas a /api se redirigen al backend)
npm run build      # versión de producción en dist/
```
