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
| **Configuración** | Receta técnica: Ancho, Alto, Cantidad de separadores.                |
| **Orden**         | Contenedor maestro: Vincula cliente, fecha y estado global.          |
| **DetalleOrden**  | "Items" de la orden: Define cuánto producir de cada escuadría.       |
| **Paquete**       | Registro único de producción. "Congela" la configuración real usada. |

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

> En modo desarrollo, las tablas se recrean desde cero en cada arranque (`sequelize.sync({ force: true })`).

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

> En desarrollo. Se documentarán conforme se implementen.

## Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 5
- **Base de Datos:** PostgreSQL
- **ORM:** Sequelize 6
- **Gestor de paquetes:** pnpm
- **Cross-env:** `cross-env` para compatibilidad multiplataforma en scripts
