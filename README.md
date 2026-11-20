# ComeTUC

Sistema web del comedor comunitario ComeTUC para organizar la despensa, las donaciones, los menús de la semana, los turnos de los voluntarios y las raciones que se sirven cada día.

Proyecto final integrador · UTN FRT · 2026

## De qué se trata

Un comedor comunitario funciona con lo que va llegando: compras, mercadería del Estado, del Banco de Alimentos, de algún comercio o de particulares. Para que eso alcance hay que saber qué hay en la despensa, qué está por vencer y qué se va a cocinar en la semana, y también quién cocina y quién sirve cada día. A fin de mes, además, hace falta poder mostrar cuántas raciones se sirvieron y qué se recibió.

ComeTUC junta todo eso en una aplicación web que se usa desde la computadora o desde el celular. Cada producto se carga una sola vez, con su categoría y un stock mínimo. Lo que llega, sea por compra o por donación, entra como un lote con su fecha de vencimiento, y lo que se usa se descuenta. Cuando algo queda por debajo del mínimo o está por vencer, el sistema lo avisa.

La semana se arma día por día, con almuerzo y merienda: el plato, para cuántas raciones y qué insumos lleva. Al confirmar un menú, esos insumos se descuentan solos de la despensa. En cada servicio se anotan los voluntarios de cocina y de servicio, y después cuántas raciones se sirvieron. Con esos datos salen los informes: los números y el gráfico del mes en el inicio, y gráficos y tablas con los totales de cada período.

Hay tres roles:

| Rol | Qué puede hacer |
|---|---|
| Administrador | Todo lo del Responsable. Además maneja los usuarios y sus roles, las categorías de la despensa y activa las cuentas nuevas. |
| Responsable | Despensa y donaciones, menús, voluntarios y turnos, e informes. |
| Voluntario | Ve el resumen del día, los menús y los turnos, y carga las raciones servidas. |

Se ingresa con correo y contraseña. Quien no tiene cuenta puede crearla desde "Registrarse": queda como Voluntario, pero no puede entrar hasta que el Administrador la active.

## Cómo lo pensamos

Estas son las decisiones principales que tomamos:

- La despensa se maneja por lotes. Cada entrada guarda su vencimiento y, cuando se usa un producto, se descuenta primero lo que vence antes. Nunca se puede sacar más de lo que hay.
- Un menú confirmado ya no se edita ni se borra, porque sus insumos ya salieron de la despensa.
- Las cuentas creadas desde el registro quedan pendientes. Es un comedor y no queríamos que cualquiera con el enlace pudiera entrar a cargar datos.
- Lo que ya tiene historia no se borra: un producto con movimientos, un voluntario que tuvo turnos o un usuario que cargó datos se dan de baja, así no se pierde lo registrado. Lo que se cargó por error y todavía no se usó, sí se puede borrar. En los dos casos se pide confirmación.
- Está pensado para usarse desde el celular, con botones grandes y todo en una columna en pantallas chicas.
- Los permisos no dependen de esconder botones. El servidor revisa el token y el rol en cada pedido, y si se desactiva una cuenta deja de funcionar en ese momento.

## Integrantes

| Nombre | Legajo | Qué hizo en el proyecto |
|---|---|---|
| Arias Nicolas | (completar) | (completar) |
| Cuevas Joel| (completar) | (completar) |
| Ghisaura Said | 61584 | tablas, base de datos y un poco del backend |

## Tecnologías

- **Frontend:**
  - React 19 con Vite y react-router-dom para la navegación;
  - Zustand para la sesión y axios para hablar con la API;
  - Bootstrap 5.3 con react-bootstrap y react-icons, adaptado a los colores del comedor y con modo oscuro;
  - Recharts para los gráficos.
- **Backend:**
  - Node.js con Express 5 (CommonJS) y nodemon para desarrollar;
  - mysql2, con consultas parametrizadas;
  - zod para validar los datos;
  - bcryptjs para las contraseñas y JWT para las sesiones;
  - cors, para que el frontend pueda llamar a la API.
- **Base de datos:** MySQL 8, con 14 tablas relacionadas. El diagrama está en [docs/der.md](docs/der.md).

## Requisitos

- Node.js 20 o más nuevo, con npm.
- MySQL 8 corriendo en `localhost:3306`, y MySQL Workbench (u otro cliente) para ejecutar los scripts.

## Instalación y ejecución

### 1. Crear la base de datos
En MySQL Workbench, conectado como `root`, abrí cada archivo con **File → Open SQL Script…** y ejecutalo entero con el rayo, en este orden:

1. `backend/db/schema.sql`: crea la base `cometuc` con sus tablas.
2. `backend/db/seed.sql`: carga los roles, los orígenes de las donaciones y las categorías.
3. `backend/db/crear-usuario.sql`: crea el usuario `cometuc_app`, que es el que usa la aplicación. Antes de ejecutarlo, cambiá `CAMBIAR_ESTA_CLAVE` por una contraseña tuya.

### 2. Configurar el backend
```bash
cd backend
copy .env.example .env
```
En `.env` completá tres datos:
- `DB_PASSWORD`, con la contraseña que pusiste en el paso anterior;
- `JWT_SECRET`, con un texto largo cualquiera;
- `PRUEBA_PASSWORD`, con la contraseña que van a usar los usuarios de prueba (8 caracteres o más).

El archivo `.env` no se sube al repositorio.

### 3. Instalar las dependencias
```bash
cd backend && npm install && npm run db:check
```
```bash
cd frontend && npm install
```
`npm run db:check` revisa que la conexión con MySQL y las tablas estén bien.

### 4. Crear los usuarios
```bash
cd backend && npm run seed:usuarios
```
Crea un usuario de prueba por cada rol (están más abajo). Si además querés un administrador propio:
```bash
cd backend && npm run seed:admin
```
Ese comando toma `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_NOMBRE` de las variables de entorno. En PowerShell, por ejemplo: `$env:ADMIN_EMAIL='…'; $env:ADMIN_PASSWORD='…'; npm run seed:admin`.

### 5. Cargar los datos iniciales (opcional, pero recomendado)
En Workbench, ejecutá entero `backend/db/datos-iniciales.sql`. Carga un mes de funcionamiento del comedor: 25 productos, 10 voluntarios, 15 donaciones, 48 menús, las raciones y los turnos. Necesita que ya exista un administrador (paso 4).

### 6. Levantar el sistema
En dos terminales:
```bash
cd backend && npm run dev
```
```bash
cd frontend && npm run dev
```
Después entrá a **http://localhost:5173**. La API queda en http://localhost:3000 y el frontend le pasa todas las llamadas a `/api`.

## Usuarios de prueba

Los crea `npm run seed:usuarios`. Los tres usan la contraseña que pusiste en `PRUEBA_PASSWORD`, que no está escrita en ningún archivo del repositorio.

| Rol | Correo |
|---|---|
| Administrador | `admin@cometuc.test` |
| Responsable | `responsable@cometuc.test` |
| Voluntario | `voluntario@cometuc.test` |

Para probar el registro:
1. creá una cuenta desde **Registrarse**;
2. entrá como Administrador y activala en **Mi cuenta → Usuarios y roles**;
3. ingresá con la cuenta nueva.

## Estructura del repositorio

```
comedor-comunitario/
├── backend/            API REST con Express
│   ├── db/             schema.sql, seed.sql, crear-usuario.sql, datos-iniciales.sql
│   ├── scripts/        db-check, seed-admin, seed-usuarios
│   ├── index.js        arranque de Express y montaje de las rutas
│   ├── config/         conexión a MySQL
│   ├── routes/         rutas por recurso (auth, stock, donaciones, menus, raciones, voluntarios, reportes, usuarios)
│   ├── controllers/    reciben el pedido y responden
│   ├── models/         consultas SQL y transacciones
│   ├── middlewares/    token, roles, validación y errores
│   └── schemas/        validaciones con zod
├── frontend/           React + Vite
│   ├── public/         íconos, logo y fotos
│   └── src/
│       ├── pages/      public/ (ingreso, registro), users/ (todos los roles), admin/ (gestión)
│       ├── router/     UsersRoute, GestionRoute y AdminRoute
│       ├── store/      useAuthStore (Zustand)
│       ├── services/   Api.js (dirección de la API)
│       ├── components/ NavBar, Footer, Layout, Encabezado, BotonTema y Graficos
│       ├── css/        todos los estilos
│       └── utils/      fechas, cantidades y errores
└── docs/               diagrama entidad-relación
```

## Más documentación

- [Diagrama entidad-relación](docs/der.md)
- [Backend: endpoints, permisos y reglas](backend/README.md)
- [Frontend: pantallas, logo y fotos](frontend/README.md)
- [Checklist de los requisitos mínimos de la cátedra](CHECKLIST-REQUISITOS.md)
