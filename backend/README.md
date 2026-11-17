# Backend – Mesa Abierta (API REST)

API de gestión operativa para comedores comunitarios. Node.js + Express + MySQL 8.
**No es un CRM**: no existen tablas de personas asistidas; las raciones se registran solo como cantidad por fecha y servicio.

## Puesta en marcha

### 1. Base de datos (MySQL Workbench, servidor MySQL 8.x en `localhost:3306`)
Conectarse como `root` y ejecutar, en este orden (`File → Open SQL Script…` y el botón ⚡):

1. `db/schema.sql`: crea la base `mesa_abierta` y sus 14 tablas.
2. `db/seed.sql`: roles (Administrador, Responsable, Voluntario), orígenes de donación y categorías.
3. `db/crear-usuario.sql`: **antes de ejecutarlo, reemplazar `CAMBIAR_ESTA_CLAVE`** por una contraseña propia. Crea el usuario `mesa_app`, con permisos solo sobre la base `mesa_abierta`.

### 2. Configuración
```
copy .env.example .env      (Windows)
```
Completar en `.env`: `DB_USER=mesa_app`, `DB_PASSWORD` (la del paso 3), `JWT_SECRET` (texto largo aleatorio). `.env` no se versiona.

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

### 5. Ejecutar
```
npm run dev                 # API en http://localhost:3000  (con recarga automática)
```
`GET /api/health` (API) y `GET /api/health/db` (API + base de datos).

## Endpoints (todos bajo `/api`, con `Authorization: Bearer <token>` salvo login y health)
| Módulo | Endpoints | Roles |
|---|---|---|
| Sesión | `POST /auth/login` (límite de intentos) · `PATCH /auth/password` (cambiar la propia contraseña) | login: público; contraseña: cualquier usuario con sesión |
| Stock | `GET /stock/productos`, `GET /stock/categorias`, `GET /stock/alertas?dias=7`, `POST /stock/productos`, `POST /stock/movimientos` | lectura: todos; escritura: Responsable, Administrador |
| Donaciones | `GET /donaciones/origenes`, `GET /donaciones`, `POST /donaciones` | lectura: todos; alta: Responsable, Administrador |
| Menús | `GET /menus`, `GET /menus/:id`, `POST /menus`, `PUT /menus/:id` y `DELETE /menus/:id` (solo si está planificado), `POST /menus/:id/confirmar` | lectura: todos; escritura: Responsable, Administrador |
| Raciones | `GET /raciones`, `PUT /raciones` (solo fecha, servicio, cantidad, observación) | todos |
| Voluntarios y turnos | `GET /voluntarios`, `POST /voluntarios`, `PATCH /voluntarios/:id`, `GET/POST /voluntarios/turnos`, `DELETE /voluntarios/turnos/:id` | lectura: todos; escritura: Responsable, Administrador |
| Reportes | `GET /reportes/raciones`, `/consumo-insumos`, `/donaciones` (`desde` y `hasta`) | Responsable, Administrador |
| Usuarios | `GET/POST /usuarios`, `PATCH /usuarios/:id` (activar/rol), `PATCH /usuarios/:id/password` (restablecer contraseña) | Administrador |

## Reglas de negocio relevantes
Stock nunca negativo (409); egresos por vencimiento más próximo (FEFO); donación e ingreso a stock en una transacción; un menú se confirma una sola vez y descuenta cantidad por ración × raciones planificadas; una fila de raciones por fecha y servicio.
