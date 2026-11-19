# Diagrama entidad-relación — ComeTUC

Base `cometuc` (MySQL 8). Hecho a partir de [`backend/db/schema.sql`](../backend/db/schema.sql). GitHub dibuja el diagrama automáticamente. También está como imagen, para imprimir o mostrar: [der.png](der.png).

```mermaid
erDiagram
    rol ||--o{ usuario : "tiene"
    usuario ||--o{ movimiento_stock : "registra"
    usuario ||--o{ donacion : "registra"
    usuario ||--o{ racion_diaria : "carga"

    categoria |o--o{ producto : "clasifica"
    producto ||--o{ lote_stock : "se guarda en"
    producto ||--o{ movimiento_stock : "tiene"
    lote_stock |o--o{ movimiento_stock : "afecta"

    origen_donacion ||--o{ donacion : "origina"
    donacion ||--|{ donacion_item : "incluye"
    producto ||--o{ donacion_item : "es donado en"
    lote_stock |o--o| donacion_item : "nace de"

    menu ||--o{ menu_insumo : "usa"
    producto ||--o{ menu_insumo : "es insumo de"

    voluntario ||--o{ turno : "cubre"

    rol {
        tinyint id PK
        varchar nombre UK "Administrador, Responsable o Voluntario"
    }
    usuario {
        int id PK
        varchar nombre
        varchar email UK
        varchar password_hash "bcrypt"
        tinyint rol_id FK
        boolean activo
        timestamp creado_en
    }
    categoria {
        smallint id PK
        varchar nombre UK
    }
    producto {
        int id PK
        varchar nombre UK
        smallint categoria_id FK "opcional"
        enum unidad "kg, g, l, ml, unidad"
        decimal stock_minimo
        boolean activo
    }
    lote_stock {
        int id PK
        int producto_id FK
        decimal cantidad_actual "CHECK >= 0"
        date fecha_vencimiento "opcional"
        timestamp creado_en
    }
    movimiento_stock {
        bigint id PK
        int producto_id FK
        int lote_id FK "opcional"
        enum tipo "ingreso o egreso"
        enum motivo "donacion, compra, consumo, merma, ajuste"
        decimal cantidad "CHECK > 0"
        date fecha
        int usuario_id FK
        varchar observacion
    }
    origen_donacion {
        tinyint id PK
        varchar nombre UK "Estado, Banco de Alimentos, Particular, Comercio"
    }
    donacion {
        int id PK
        tinyint origen_id FK
        varchar referencia "sin datos personales"
        date fecha
        int usuario_id FK
        varchar observacion
    }
    donacion_item {
        int id PK
        int donacion_id FK "ON DELETE CASCADE"
        int producto_id FK
        decimal cantidad "CHECK > 0"
        date fecha_vencimiento
        int lote_id FK "lote que creó"
    }
    menu {
        int id PK
        date fecha "UNIQUE con servicio"
        enum servicio "almuerzo o merienda"
        varchar nombre_plato
        int raciones_planificadas
        enum estado "planificado o confirmado"
    }
    menu_insumo {
        int id PK
        int menu_id FK "ON DELETE CASCADE"
        int producto_id FK
        decimal cantidad_por_racion "CHECK > 0"
    }
    racion_diaria {
        int id PK
        date fecha "UNIQUE con servicio"
        enum servicio "almuerzo o merienda"
        int cantidad "solo la cantidad"
        int usuario_id FK
        varchar observacion
    }
    voluntario {
        int id PK
        varchar nombre_visible "nombre o apodo"
        boolean activo
    }
    turno {
        int id PK
        date fecha
        enum servicio "almuerzo o merienda"
        enum tarea "cocina o servicio"
        int voluntario_id FK
    }
```

## Reglas de la base

| Regla | Dónde |
|---|---|
| El stock nunca es negativo | `lote_stock.cantidad_actual CHECK (>= 0)`; además, la API responde 409 si no alcanza |
| Cantidades siempre positivas | `CHECK (> 0)` en `movimiento_stock`, `donacion_item` y `menu_insumo` |
| Un menú y una fila de raciones por día y servicio | `UNIQUE (fecha, servicio)` en `menu` y en `racion_diaria` |
| Una persona no se repite en el mismo turno | `UNIQUE (fecha, servicio, tarea, voluntario_id)` en `turno` |
| Al borrar una donación o un menú se borran sus ítems | `ON DELETE CASCADE` en `donacion_item` y `menu_insumo` |
| Correos y nombres de producto únicos | `UNIQUE` en `usuario.email` y `producto.nombre` |
| Sin datos de personas asistidas | No hay tablas de personas asistidas: `racion_diaria` guarda solo cantidades y `voluntario` solo un nombre o apodo |

**Notas**
- `racion_diaria` y `menu` se relacionan por fecha y servicio, no con una FK: las raciones servidas se cargan aunque no haya menú.
