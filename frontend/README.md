# Frontend – ComeTUC

Interfaz web en React + Vite, armada con lo que se vio en clase: react-router-dom, Zustand, axios, Bootstrap (react-bootstrap), react-icons y Recharts para los gráficos. Tiene botón de modo oscuro.

## Pantallas
**Públicas:** `/login` y `/registro` (la cuenta nueva queda pendiente hasta que el Administrador la active).

**Privadas** (según el rol):
- **Inicio** (`/`): resumen del día (menú, quién cocina, raciones). Administrador y Responsable ven además los números del mes y el gráfico de raciones.
- **Raciones** (`/raciones`): cantidad servida por día y servicio.
- **Semana** (`/semana`): menús y turnos día por día; detalle del menú en `/semana/menus/:id`.
- **Despensa** (Administrador y Responsable): productos con buscador, filtro por categoría y alertas; movimientos de stock; donaciones con su detalle. Las categorías, solo el Administrador.
- **Voluntarios** e **Informes** (Administrador y Responsable). Informes tiene cuatro gráficos (Recharts) y tablas con los totales del período.
- **Mi cuenta** (`/cuenta`) y **Usuarios y roles** (solo Administrador).

| Entidad | Listado | Alta | Edición |
|---|---|---|---|
| Producto | `/productos` | `/productos/nuevo` | `/productos/:id/editar` |
| Categoría | `/categorias` | `/categorias/nueva` | `/categorias/:id/editar` |
| Donación | `/donaciones` | `/donaciones/nueva` | `/donaciones/:id/editar` |
| Menú | `/semana` | `/semana/menus/nuevo` | `/semana/menus/:id/editar` |
| Voluntario | `/voluntarios` | `/voluntarios/nuevo` | `/voluntarios/:id/editar` |
| Usuario | `/usuarios` | `/usuarios/nuevo` | `/usuarios/:id/editar` |

El borrado se hace desde cada listado y pide confirmación con `window.confirm`.

## Organización del código
```
src/
├── main.jsx               importa Bootstrap y css/index.css, y monta App
├── App.jsx                BrowserRouter + Routes
├── router/                UsersRoute, GestionRoute y AdminRoute (Outlet o Navigate según user.rol)
├── store/useAuthStore.js  Zustand: user (con su token) y tema, en localStorage; login, logout y cambiarTema
├── services/Api.js        BASE_URL de la API y el encabezado con el token
├── components/            NavBar, Footer, Layout, Encabezado, BotonTema y Graficos (Recharts)
├── pages/
│   ├── public/            Login, Registro, NotFound, Unauthorized
│   ├── users/             Home, Raciones, Semana, MenuDetalle, Cuenta
│   └── admin/             Productos, ProductoForm, Movimiento, Categorias, CategoriaForm,
│                          Donaciones, DonacionForm, DonacionDetalle, MenuForm, Voluntarios,
│                          VoluntarioForm, Usuarios, UsuarioForm, Contrasena, Informes
├── utils/                 fechas, cantidades y texto de los errores
└── css/                   estilos
```

Cada pantalla trae sus datos así:
```js
const getProductos = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/stock/productos`, conToken(user))
    setProductos(response.data)
  } catch (err) {
    setError(mensajeError(err))
  } finally {
    setLoading(false)
  }
}

useEffect(() => {
  getProductos()
}, [])
```

## Estilos (`src/css/`)
Bootstrap se importa en `main.jsx` y después `css/index.css`. Ningún `.jsx` tiene estilos escritos: se usan clases de Bootstrap o estos archivos.

| Archivo | Qué tiene |
|---|---|
| `variables.css` | Colores del comedor, variables de Bootstrap (`--bs-*`) y los colores del modo oscuro. |
| `tema.css` | Botones con los colores del comedor. |
| `base.css` | Fondo, barra, formularios y contador de raciones. |
| `ingreso.css` | Pantallas de ingreso y registro. |
| `graficos.css` | Tarjetas y ejes de los gráficos. |
| `semana.css` | Días de la semana y turnos. |
| `colorido.css` | Modo claro con los colores del logo: franjas de color, tarjetas con borde de color, tablas y botones. Solo se aplica en modo claro. |

## Modo oscuro
El botón con la luna (en la barra y en el ingreso) cambia `tema` en el store. `App.jsx` lo aplica con `document.documentElement.setAttribute('data-bs-theme', tema)`, que es el modo oscuro que trae Bootstrap 5.3, y queda guardado en `localStorage`.

## Logo y fotos
`public/imagenes/` tiene `logo-simbolo.jpg` y `logo-nombre.jpg` (barra), `logo-completo.jpg` y `portada.jpg` (ingreso) e `inicio.jpg` (foto del banner de Inicio). El logo original no va en el repositorio. No uses fotos donde se pueda reconocer a las personas que asisten al comedor.

## Requisitos
Node.js 20 o más nuevo y la API del `backend/` en marcha en `http://localhost:3000`.

## Uso
```
npm install
npm run dev        # http://localhost:5173
npm run build      # versión de producción en dist/
```
