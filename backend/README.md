# Backend – ComeTUC (API REST)

API de gestión operativa para comedores comunitarios. Node.js + Express + MySQL 8.
No se guardan datos de las personas asistidas: las raciones se registran solo como cantidad por fecha y servicio.

## Puesta en marcha

### 1. Base de datos (MySQL Workbench, servidor MySQL 8.x en `localhost:3306`)
Conectarse como `root` y ejecutar, en este orden (`File → Open SQL Script…` y el botón ⚡):

1. `db/schema.sql`: crea la base `cometuc` y sus 14 tablas.
2. `db/seed.sql`: roles (Administrador, Responsable, Voluntario), orígenes de donación y categorías.
3. `db/crear-usuario.sql`: **antes de ejecutarlo, reemplazar `CAMBIAR_ESTA_CLAVE`** por una contraseña propia. Crea el usuario `cometuc_app`, con permisos solo sobre la base `cometuc`.

Si ya tenías la base creada con el nombre anterior (`mesa_abierta`), no la crees de nuevo: ejecutá una sola vez `db/renombrar-base.sql`, que la pasa a `cometuc` con todos los datos, y en `.env` cambiá `DB_USER=cometuc_app` y `DB_NAME=cometuc`.

### 2. Configuración
```
copy .env.example .env      (Windows)
```
Completar en `.env`: `DB_USER=cometuc_app`, `DB_PASSWORD` (la del paso 3), `JWT_SECRET` (texto largo aleatorio). `.env` no se versiona.

### 3. Instalar y comprobar
```
npm install
npm run db:check            # diagnostica la conexión, las tablas y los roles
```

### 4. Crear el administrador inicial
```
ADMIN_EMAIL=correo@ejemplo.com ADMIN_PASSWORD='una-clave-de-8+' ADMIN_NOMBRE='Nombre' npm run seed:admin
```
(En PowerShell: `$env:ADMIN_EMAIL='…'; $env:ADMIN_PASSWORD='…'; npm run seed:admin`.)

Usuarios de prueba, uno por rol (`admin@cometuc.test`, `responsable@cometuc.test` y `voluntario@cometuc.test`), con la contraseña de `PRUEBA_PASSWORD` en `.env`:
```
npm run seed:usuarios
```

### 5. Cargar los datos iniciales (MySQL Workbench)
Con el administrador ya creado, abrir `db/datos-iniciales.sql` y ejecutarlo entero (⚡). Carga un mes de
funcionamiento del comedor: 25 productos, 10 voluntarios, 15 donaciones, 48 menús (los de semanas pasadas
confirmados; los de esta semana y la próxima, planificados), raciones de cada día, turnos y el stock que corresponde.
- Las fechas se calculan desde el día en que se ejecuta y quedan fijas en la base.
- Se carga una sola vez: si ya está cargado, lo avisa y no hace nada. Si algo falla, no queda nada a medias.
- No pisa lo que ya existe: los días que ya tienen menú o raciones se saltean.

### 6. Ejecutar
```
npm run dev                 # API en http://localhost:3000  (con nodemon)
```
`GET /api/health` responde si la API está en marcha. Al arrancar, `initServer()` prueba la conexión con la base antes de escuchar.

## Organización del código
Está armado como en las clases (CommonJS, con `require` y `module.exports`):

```
backend/
├── index.js        crea la app de Express, monta las rutas y arranca con initServer()
├── config/db.js    pool de mysql2/promise (lee el .env) y transaccion()
├── routes/         una por recurso: método HTTP + ruta + middlewares + controlador
├── controllers/    reciben el pedido y responden (try/catch → next(error))
├── models/         el SQL, siempre con parámetros ?, y las transacciones
├── middlewares/    auth.js (verifyToken, checkRole), validate.js (zod), errors.js
├── schemas/        esquemas de zod de cada recurso
├── utils/          fechas
├── scripts/        db-check, seed-admin, seed-usuarios
└── db/             scripts SQL
```

| Archivo | Qué hace |
|---|---|
| `routes/<recurso>.routes.js` | Define cada ruta con su método, valida con zod (`validate(schema)`) y aplica los permisos (`checkRole(...)`). |
| `controllers/<recurso>.controllers.js` | Funciones `getX`, `postX`, `putX`, `patchX` y `deleteX`: leen `req.params` y `req.body`, llaman al modelo y responden con el código que corresponde. |
| `models/<recurso>.model.js` | Las consultas (`const [rows] = await conection.query(sql, [valores])`) y las reglas que van dentro de una transacción (por ejemplo, "no se puede borrar un menú confirmado"). |

`index.js` protege las rutas privadas con `verifyToken` y al final usa `notFound` y `errorHandler`. El modelo de stock (`ingresarStock`, `egresarStock` y `obtenerAlertas`) también lo usan donaciones, menús y reportes.

Errores de validación (400): `{ "error": "Datos inválidos", "errors": [{ "field": "...", "message": "..." }] }`.

## Endpoints (todos bajo `/api`, con `Authorization: Bearer <token>` salvo login y health)
| Módulo | Endpoints | Roles |
|---|---|---|
| Sesión | `POST /auth/login` (403 si la cuenta todavía no está activa) · `POST /auth/registro` (crea un Voluntario **inactivo** hasta que el Administrador lo active) · `PATCH /auth/password` (cambiar la propia contraseña) | login y registro: públicos; contraseña: cualquier usuario con sesión |
| Stock | `GET /stock/productos`, `GET /stock/productos/:id`, `GET /stock/alertas?dias=7`, `POST /stock/productos`, `PUT /stock/productos/:id` (editar), `PATCH /stock/productos/:id` (baja, solo sin stock), `DELETE /stock/productos/:id` (solo si no tiene historial), `POST /stock/movimientos` | lectura: todos; escritura: Responsable, Administrador |
| Categorías | `GET /stock/categorias` (con la cantidad de productos de cada una), `GET /stock/categorias/:id`, `POST /stock/categorias`, `PUT /stock/categorias/:id` (409 si el nombre ya existe), `DELETE /stock/categorias/:id` (sus productos quedan "Sin categoría"; no se borra ninguno) | lectura: todos; escritura: solo Administrador |
| Donaciones | `GET /donaciones/origenes`, `GET /donaciones`, `GET /donaciones/:id`, `POST /donaciones`, `PUT /donaciones/:id` y `DELETE /donaciones/:id` (cambiar productos o borrar solo si no se usó nada) | lectura: todos; escritura: Responsable, Administrador |
| Menús | `GET /menus`, `GET /menus/:id`, `POST /menus`, `PUT /menus/:id` y `DELETE /menus/:id` (solo si está planificado), `POST /menus/:id/confirmar` | lectura: todos; escritura: Responsable, Administrador |
| Raciones | `GET /raciones`, `PUT /raciones` (solo fecha, servicio, cantidad, observación), `DELETE /raciones/:id` | cargar: todos; borrar: Responsable, Administrador |
| Voluntarios y turnos | `GET /voluntarios` (`?todos=1` incluye bajas), `GET /voluntarios/:id`, `POST /voluntarios`, `PATCH /voluntarios/:id`, `DELETE /voluntarios/:id` (solo si nunca tuvo turnos), `GET/POST /voluntarios/turnos`, `DELETE /voluntarios/turnos/:id` | lectura: todos; escritura: Responsable, Administrador |
| Reportes | `GET /reportes/raciones`, `/consumo-insumos`, `/donaciones`, `/tablero` (métricas para los gráficos) (`desde` y `hasta`) | Responsable, Administrador |
| Usuarios | `GET/POST /usuarios`, `GET /usuarios/:id`, `PATCH /usuarios/:id` (nombre, correo, activar, rol), `PATCH /usuarios/:id/password` (restablecer contraseña), `DELETE /usuarios/:id` (solo si no cargó nada; sirve para rechazar un registro) | Administrador |

## Reglas de negocio relevantes
Stock nunca negativo (409); egresos por vencimiento más próximo (FEFO); donación e ingreso a stock en una transacción; un menú se confirma una sola vez y descuenta cantidad por ración × raciones planificadas; una fila de raciones por fecha y servicio.

**Borrar o dar de baja:** producto, voluntario y usuario se borran de verdad solo si no tienen historial. Si ya tienen movimientos, turnos o datos cargados, la API responde 409 y se los da de baja, para no perder lo registrado.

**Sesión:** en cada pedido, `verifyToken` verifica el JWT y además consulta la base. Si la cuenta fue desactivada, responde 401 en el acto, y siempre usa el rol actual: un cambio de rol no espera a que venza el token.
