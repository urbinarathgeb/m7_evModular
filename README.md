# CutLog API

## Descripción

**CutLog API** es un asistente de producción _Just-in-Time_ diseñado para aserraderos. Su misión es eliminar la carga mental del operario y garantizar la trazabilidad mediante la gestión precisa de pedidos.

### Objetivos Clave

- **Eliminar la ambigüedad:** Evitar que el operario olvide las medidas o la configuración de apilado (piezas, filas, separadores).
- **Gestión de Pedidos:** Control total sobre qué falta producir para satisfacer la demanda real del cliente.
- **Trazabilidad Extrema:** Registro histórico inmutable de cómo se configuró cada paquete, incluyendo la configuración de apilado real usada.
- **Simplicidad Operativa:** Registro rápido mediante valores sugeridos con libertad total para realizar ajustes manuales ("Override").

### Filosofía del Sistema

- **Pedido-Céntrico:** El sistema no busca llenar un inventario infinito; solo existe para cumplir órdenes de venta.
- **Agnosticismo del Material:** El sistema no depende del tipo de madera. La unidad de trabajo es la **Escuadría (Dimensiones)**.
- **Configuración Reutilizable:** Las configuraciones de apilado (StackConfig) son independientes de las dimensiones. Dos dimensiones distintas pueden compartir la misma configuración.
- **Flexibilidad (Default vs. Override):** Cada dimensión tiene una configuración de apilado sugerida (default), pero al registrar un paquete el operario puede elegir cualquier otra configuración existente o crear una nueva en el momento.

## Arquitectura de Datos

Para permitir órdenes mixtas (múltiples medidas en un mismo pedido), la base de datos se organiza así:

| **Entidad**       | **Propósito**                                                        |
|-------------------|----------------------------------------------------------------------|
| **Escuadría**     | Catálogo base de medidas físicas (ej: 18x90x3000).                   |
| **Configuración** | Receta técnica reutilizable: Ancho, Alto, filas entre separadores.   |
| **Orden**         | Contenedor maestro: Vincula cliente, fecha y estado global.          |
| **DetalleOrden**  | "Items" de la orden: Define cuánto producir de cada escuadría.       |
| **Paquete**       | Registro único de producción. "Congela" la configuración real usada. |

### Campos por Modelo

#### Dimension (`dimensions`)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | INTEGER (PK) | Identificador único |
| `thickness` | INTEGER | Espesor en milímetros |
| `width` | INTEGER | Ancho en milímetros |
| `length` | INTEGER | Largo en milímetros |
| `default_stack_config_id` | INTEGER (FK) | Configuración de apilado sugerida (obligatoria) |
| `deleted_at` | TIMESTAMP | Soft delete (automático) |

> Índice único en `(thickness, width, length)` para evitar duplicados activos.

#### StackConfig (`stack_configs`)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | INTEGER (PK) | Identificador único |
| `width_stack` | INTEGER | Piezas a lo ancho |
| `height_stack` | INTEGER | Piezas a lo alto |
| `separator_every` | INTEGER | Filas entre cada separador |
| `deleted_at` | TIMESTAMP | Soft delete (automático) |

> Las configuraciones de apilado son independientes y reutilizables entre dimensiones.

#### Order (`orders`)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | INTEGER (PK) | Identificador único |
| `client` | VARCHAR(100) | Nombre del cliente |
| `order_date` | TIMESTAMP | Fecha del pedido |
| `status` | ENUM | `pending`, `in_production`, `completed`, `delivered` |
| `deleted_at` | TIMESTAMP | Soft delete (automático) |

#### OrderItem (`order_items`)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | INTEGER (PK) | Identificador único |
| `order_id` | INTEGER (FK) | Referencia a `orders` |
| `dimension_id` | INTEGER (FK) | Referencia a `dimensions` |
| `quantity` | INTEGER | Cantidad de paquetes a producir |
| `deleted_at` | TIMESTAMP | Soft delete (automático) |

#### Bundle (`bundles`)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | INTEGER (PK) | Identificador único |
| `order_item_id` | INTEGER (FK) | Referencia a `order_items` |
| `stack_config_id` | INTEGER (FK) | Configuración de apilado usada (puede ser distinta al default) |
| `produced_at` | TIMESTAMP | Fecha de producción |
| `total_pieces` | INTEGER | Piezas totales (`widthStack * heightStack`) |
| `cubic_meters` | DECIMAL(10,4) | Volumen total en m³ |
| `deleted_at` | TIMESTAMP | Soft delete (automático) |

### Estrategia de Soft Delete

Todos los modelos usan **soft delete** (`paranoid: true` en Sequelize). Esto significa:

- **`DELETE` no elimina físicamente** — solo marca `deleted_at` con la fecha actual
- **Todas las queries excluyen automáticamente** los registros con `deleted_at`
- **Se puede restaurar** un registro eliminado con `restore()`
- **Índice único en Dimension:** Si se soft-deletea una dimensión y se intenta crear una idéntica, el service layer detecta la dimensión borrada y la **restaura** en lugar de crear un duplicado

### Relaciones

| Relación | Tipo |
|---|---|
| Order ↔ Dimension | N:M (a través de OrderItem) |
| Dimension → StackConfig | N:1 (default_stack_config_id, obligatorio) |
| StackConfig → Dimension | 1:N (puede ser default de muchas dimensiones) |
| Order → OrderItem | 1:N |
| Dimension → OrderItem | 1:N |
| OrderItem → Bundle | 1:N |
| StackConfig → Bundle | 1:N |

## Setup

### Requisitos Previos

- Node.js >= 18
- PostgreSQL >= 14
- pnpm

### Instalación

1. Clonar el repositorio:
   ```bash
   git clone <repo-url>
   cd m7_evModular
   ```

2. Instalar dependencias:
   ```bash
   pnpm install
   ```

3. Crear la base de datos en PostgreSQL:
   ```sql
   CREATE DATABASE "cutlogDB";
   ```

4. Configurar el archivo `.env` (copiar `.env.example` si existe):
   ```bash
   cp .env.example .env
   ```

5. Ajustar las variables de entorno según tu configuración local.

### Ejecución

```bash
# Desarrollo (con hot-reload)
pnpm dev

# Producción
pnpm start
```

> En modo desarrollo, las tablas se recrean desde cero en cada arranque (`sequelize.sync({ force: true })`). El seed inicial se ejecuta automáticamente.

### Entornos

El proyecto distingue entre desarrollo y producción usando archivos `.env` separados:

| Entorno         | Archivo                              | Comando      | Puerto | CORS                      |
|-----------------|--------------------------------------|--------------|--------|---------------------------|
| Desarrollo      | `.env` + `.env.development`          | `pnpm dev`   | 3001   | `*`                       |
| Producción (sim)| `.env` + `.env.production`           | `pnpm start` | 3002   | `http://localhost:5173`   |

#### Simulación local

Para probar el entorno de producción en local:

1. Ejecuta `pnpm start`
2. La API correrá en el puerto **3002** con CORS restringido a `http://localhost:5173` (puerto por defecto de Vite)

> En un despliegue real de producción, se debe ajustar `PORT` y `CORS_ORIGIN` en `.env.production` con los valores correspondientes al servidor.

## Variables de Entorno

| Variable            | Descripción                        | Default       |
|---------------------|------------------------------------|---------------|
| `PG_HOST`           | Host de PostgreSQL                 | `localhost`   |
| `PG_PORT`           | Puerto de PostgreSQL               | `5432`        |
| `PG_USER`           | Usuario de PostgreSQL              | `postgres`    |
| `PG_PASSWORD`       | Contraseña de PostgreSQL           | _(vacío)_     |
| `PG_DATABASE`       | Nombre de la base de datos         | `cutlogDB`    |
| `PORT`              | Puerto del servidor                | `3001`        |
| `NODE_ENV`          | Entorno (`development`/`production`) | `development` |
| `CORS_ORIGIN`       | Origen permitido para CORS         | `*`           |
| `ALLOW_EXIT_ON_IDLE`| Cerrar pool al salir               | `true`        |

## Endpoints

### Dimensions

| Método | Ruta | Descripción | Validación |
|---|---|---|---|
| `GET` | `/api/dimensions` | Listar todas las dimensiones | — |
| `GET` | `/api/dimensions/:id` | Obtener dimensión por ID | ID entero positivo |
| `POST` | `/api/dimensions` | Crear nueva dimensión con StackConfig default | `thickness`, `width`, `length` + `stackConfig` obligatorios |
| `PUT` | `/api/dimensions/:id` | Actualizar dimensión (completa) | Los 3 campos obligatorios, enteros > 0 |
| `PATCH` | `/api/dimensions/:id` | Actualizar dimensión (parcial) | Al menos un campo, enteros > 0 |
| `POST` | `/api/dimensions/:id/restore` | Restaurar dimensión eliminada | ID entero positivo |
| `DELETE` | `/api/dimensions/:id` | Eliminar dimensión (soft delete) | ID entero positivo |

> Para pruebas completas, ver `src/request/dimensions.http` (28 casos de prueba).

#### Comportamiento especial

- **Soft delete:** `DELETE` no elimina físicamente, solo marca `deleted_at`. La dimensión desaparece de las consultas pero se puede restaurar.
- **Restore al crear duplicada:** Si se intenta crear una dimensión con las mismas medidas que una soft-deleted, el sistema la restaura automáticamente en vez de crear un nuevo registro.
- **Índice único:** No permite crear dos dimensiones activas con las mismas medidas (`thickness`, `width`, `length`).
- **StackConfig obligatorio:** Toda dimensión se crea con su configuración de apilado default. No existe una dimensión sin configuración sugerida.
- **Reutilización de StackConfig:** Al crear una dimensión, si ya existe un StackConfig con los mismos valores (activo o soft-deleted), se reutiliza/restaura en lugar de crear uno duplicado.

### StackConfigs

| Método | Ruta | Descripción | Validación |
|---|---|---|---|
| `GET` | `/api/stack-configs` | Listar todas las configuraciones de apilado | — |
| `GET` | `/api/stack-configs/:id` | Obtener configuración por ID (con dimensiones que la usan como default) | ID entero positivo |
| `POST` | `/api/stack-configs` | Crear nueva configuración de apilado | `widthStack`, `heightStack` obligatorios, `separatorEvery` opcional |
| `PUT` | `/api/stack-configs/:id` | Actualizar configuración (completa) | `widthStack`, `heightStack` obligatorios, `separatorEvery` opcional |
| `PATCH` | `/api/stack-configs/:id` | Actualizar configuración (parcial) | Al menos un campo, enteros > 0 |
| `POST` | `/api/stack-configs/:id/restore` | Restaurar configuración eliminada | ID entero positivo |
| `DELETE` | `/api/stack-configs/:id` | Eliminar configuración (soft delete) | ID entero positivo |

> Para pruebas completas, ver `src/request/stack_configs.http` (35 casos de prueba).

#### Comportamiento especial

- **Soft delete:** `DELETE` no elimina físicamente, solo marca `deleted_at`. La configuración desaparece de las consultas pero se puede restaurar.
- **Restore al crear duplicada:** Si se intenta crear una configuración con los mismos valores que una soft-deleted, el sistema la restaura automáticamente en vez de crear un nuevo registro.
- **Índice único:** No permite crear dos configuraciones activas con los mismos valores (`widthStack`, `heightStack`, `separatorEvery`).
- **Eliminación bloqueada:** Si una configuración es `defaultStackConfigId` de una o más dimensiones activas, no se puede eliminar. Retorna `409 ConflictError`.
- **separatorEvery automático:** Si no se proporciona, se calcula automáticamente: si `heightStack <= 10` → `heightStack`, sino → `Math.ceil(heightStack / 5)`.

### Orders

| Método | Ruta | Descripción | Validación |
|---|---|---|---|
| `GET` | `/api/orders` | Listar todas las órdenes (con dimensiones incluidas) | — |
| `GET` | `/api/orders/:id` | Obtener orden por ID (con dimensiones) | ID entero positivo |
| `POST` | `/api/orders` | Crear nueva orden con dimensiones | `client` obligatorio, `dimensions` array con al menos 1 item |
| `PUT` | `/api/orders/:id` | Actualizar orden (completa) | `client` y `orderDate` obligatorios, `status` opcional |
| `PATCH` | `/api/orders/:id` | Actualizar orden (parcial) | Al menos un campo válido |
| `POST` | `/api/orders/:id/restore` | Restaurar orden eliminada | ID entero positivo |
| `DELETE` | `/api/orders/:id` | Eliminar orden (soft delete) | ID entero positivo |

> Para pruebas completas, ver `src/request/orders.http` (26 casos de prueba).

#### Formato de fecha

- **Input:** `DD-MM-YYYY` (ej: `28-05-2026`)
- **Output:** `orderDate` en formato `DD-MM-YYYY`, `createdAt`/`updatedAt` en ISO

#### Comportamiento especial

- **Status automático:** Toda orden se crea con `status: "pending"`. No se puede enviar `status` al crear.
- **Respuesta aplanada:** Las dimensiones se devuelven con formato extendido:
  ```json
  {
    "dimension": "45x70x3200",
    "stackConfig": "15x14",
    "quantity": 5,
    "produced": 3,
    "pending": 2,
    "status": "in_progress"
  }
  ```
  - `stackConfig`: configuración de apilado sugerida (default de la dimensión)
  - `produced`: cantidad de bundles registrados para ese item
  - `pending`: `quantity - produced`
  - `status`: `not_started` (0 producidos), `in_progress` (parcial), `completed` (todos producidos)
- **Rollback en error:** Si una dimensión del array no existe, se elimina la orden creada para evitar órdenes huérfanas.

### OrderItems

| Método | Ruta | Descripción | Validación |
|---|---|---|---|
| `POST` | `/api/orders/:id/items` | Agregar items a una orden existente | `items` array con al menos 1 `{ dimensionId, quantity }` |
| `PATCH` | `/api/orders/:id/items/:itemId` | Actualizar cantidad de un item | Al menos un campo válido, enteros > 0 |
| `DELETE` | `/api/orders/:id/items/:itemId` | Eliminar un item (soft delete) | ID de orden y item enteros positivos |
| `POST` | `/api/orders/:id/items/:itemId/restore` | Restaurar item eliminado | ID de orden y item enteros positivos |

> Para pruebas completas, ver `src/request/orders_items.http` (24 casos de prueba).

#### Restricción de estado

Las operaciones sobre items solo están permitidas cuando la orden está en estado `pending` o `in_production`. Si la orden está en `completed` o `delivered`, se retorna `409 ConflictError`.

#### Comportamiento especial

- **Dimensión duplicada:** Si se agrega una dimensión que ya existe en la orden, se suma la cantidad al item existente en lugar de crear uno nuevo.
- **Respuesta:** Todas las operaciones retornan la orden completa con sus items aplanados (incluye `stackConfig`, `produced`, `pending`, `status` por item).
- **Eliminar último item:** Permitido. La orden queda sin items pero no se auto-elimina.
- **Soft delete:** `DELETE` no elimina físicamente, solo marca `deleted_at`. El item se puede restaurar.

### Bundles

| Método | Ruta | Descripción | Validación |
|---|---|---|---|
| `POST` | `/api/orders/:id/items/:itemId/bundles` | Registrar un bundle (cálculo automático) | `stackConfigId` opcional (entero positivo) |
| `GET` | `/api/orders/:id/items/:itemId/bundles` | Listar bundles de un item | ID de orden y item enteros positivos |
| `GET` | `/api/bundles/:id` | Obtener bundle por ID | ID entero positivo |
| `PATCH` | `/api/bundles/:id` | Actualizar `stackConfigId` del bundle (recalcula dimensiones) | Solo `stackConfigId` permitido |
| `DELETE` | `/api/bundles/:id` | Eliminar bundle (soft delete) | ID entero positivo |
| `POST` | `/api/bundles/:id/restore` | Restaurar bundle eliminado | ID entero positivo |

> Para pruebas completas, ver `src/request/bundles.http` (26 casos de prueba).

#### Cálculo automático

Al registrar un bundle, el sistema calcula automáticamente:

- **`totalPieces`** = `widthStack * heightStack` (del StackConfig)
- **`cubicMeters`** = `(thickness * width * length * totalPieces) / 1,000,000,000` (dimensiones en mm → m³)
- **`producedAt`** = fecha actual (automático)

#### Comportamiento especial

- **StackConfig default:** Si no se envía `stackConfigId`, se usa el `defaultStackConfigId` de la dimensión del item.
- **Restricción de estado:** Solo se pueden registrar bundles si la orden está en `pending` o `in_production`. Si está en `completed` o `delivered`, se retorna `409 ConflictError`.
- **PATCH:** Solo permite cambiar `stackConfigId`. Al actualizar, se recalculan automáticamente `totalPieces` y `cubicMeters` con la nueva configuración.
- **Soft delete:** `DELETE` no elimina físicamente, solo marca `deleted_at`. El bundle se puede restaurar.
- **Respuesta aplanada:** El bundle se devuelve con formato simplificado:
  ```json
  {
    "dimension": "45x70x3200",
    "stackConfig": "15x14",
    "totalPieces": 210,
    "cubicMeters": 0.0470,
    "producedAt": "29-05-2026"
  }
  ```

### Stock

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/stock` | Vista de stock global (todas las órdenes agrupadas por dimensión) |

> Para pruebas completas, ver `src/request/stock.http`.

#### Respuesta

Cada entrada del stock agrupa todos los pedidos de una misma dimensión:

```json
{
  "dimension": "45x70x3200",
  "stackConfig": "15x14",
  "totalOrdered": 15,
  "totalProduced": 10,
  "totalPending": 5,
  "orders": [
    { "orderId": 1, "client": "Cliente A", "status": "pending", "quantity": 5, "produced": 3 },
    { "orderId": 2, "client": "Cliente B", "status": "in_production", "quantity": 10, "produced": 7 }
  ]
}
```

## Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 5
- **Base de Datos:** PostgreSQL
- **ORM:** Sequelize 6 (con soft delete en todos los modelos)
- **Gestor de paquetes:** pnpm
- **Cross-env:** `cross-env` para compatibilidad multiplataforma en scripts
