# CutLog API

## Descripción

**CutLog API** es un asistente de producción _Just-in-Time_ diseñado para aserraderos. Su misión es eliminar la carga mental del operario y garantizar la trazabilidad mediante la gestión precisa de pedidos.

### Objetivos Clave

- **Eliminar la ambigüedad:** Evitar que el operario olvide las medidas o la configuración de apilado (piezas, filas, separadores).
- **Gestión de Pedidos:** Control total sobre qué falta producir para satisfacer la demanda real del cliente.
- **Trazabilidad Extrema:** Registro histórico inmutable de cómo se configuró cada paquete.
- **Simplicidad Operativa:** Registro rápido mediante valores sugeridos con libertad total para realizar ajustes manuales ("Override").

### Filosofía del Sistema

- **Pedido-Céntrico:** El sistema no busca llenar un inventario infinito; solo existe para cumplir órdenes de venta.
- **Agnosticismo del Material:** El sistema no depende del tipo de madera. La unidad de trabajo es la **Escuadría (Dimensiones)**.
- **Flexibilidad (Default vs. Override):** Se estandariza el trabajo para el 90% de los casos, pero se permite la personalización total para el 10% de pedidos especiales.

## Arquitectura de Datos

Para permitir órdenes mixtas (múltiples medidas en un mismo pedido), la base de datos se organiza así:

| **Entidad**       | **Propósito**                                                        |
|-------------------|----------------------------------------------------------------------|
| **Escuadría**     | Catálogo base de medidas físicas (ej: 18x90x3000).                   |
| **Configuración** | Receta técnica: Ancho, Alto, filas entre separadores.                |
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
| `deleted_at` | TIMESTAMP | Soft delete (automático) |

> Índice único en `(thickness, width, length)` para evitar duplicados activos.

#### StackConfig (`stack_configs`)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | INTEGER (PK) | Identificador único |
| `dimension_id` | INTEGER (FK) | Referencia a `dimensions` |
| `width_stack` | INTEGER | Piezas a lo ancho |
| `height_stack` | INTEGER | Piezas a lo alto |
| `separator_every` | INTEGER | Filas entre cada separador |
| `deleted_at` | TIMESTAMP | Soft delete (automático) |

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
| `stack_config_id` | INTEGER (FK) | Referencia a `stack_configs` |
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
| Dimension → StackConfig | 1:N |
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
| `POST` | `/api/dimensions` | Crear nueva dimensión | `thickness`, `width`, `length` obligatorios (enteros > 0) |
| `PUT` | `/api/dimensions/:id` | Actualizar dimensión | Al menos un campo, enteros > 0 |
| `DELETE` | `/api/dimensions/:id` | Eliminar dimensión (soft delete) | ID entero positivo |

> Para pruebas completas, ver `src/request/dimensions.http` (22 casos de prueba).

#### Comportamiento especial

- **Soft delete:** `DELETE` no elimina físicamente, solo marca `deleted_at`. La dimensión desaparece de las consultas pero se puede restaurar.
- **Restore al crear duplicada:** Si se intenta crear una dimensión con las mismas medidas que una soft-deleted, el sistema la restaura automáticamente en vez de crear un nuevo registro.
- **Índice único:** No permite crear dos dimensiones activas con las mismas medidas (`thickness`, `width`, `length`).

## Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 5
- **Base de Datos:** PostgreSQL
- **ORM:** Sequelize 6 (con soft delete en todos los modelos)
- **Gestor de paquetes:** pnpm
- **Cross-env:** `cross-env` para compatibilidad multiplataforma en scripts
