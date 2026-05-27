# AGENTS.md

Este proyecto debe ser desarrollado bajo los siguientes estándares estrictos.

## Stack y Configuración
* **Runtime:** Node.js (ES Modules, `"type": "module"`). **Sin TypeScript** — el proyecto usa JavaScript puro.
* **Framework:** Express 5.
* **Base de Datos:** PostgreSQL.
* **ORM:** Sequelize 6.
    * Convención: Tablas/columnas en **Inglés**, datos en **Español**.
    * Setup: Credenciales vía `process.env` (ver `.env`: `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DATABASE`). BD: `cutlogDB`.
    * Configuración: `src/config/db.config.js` inicializa la instancia de Sequelize.
    * Modelos: Definidos en `src/models/*.model.js`.
    * **Prohibido:** No utilizar queries SQL crudas (`db.query`) a menos que sea estrictamente necesario y previo aviso. Priorizar métodos de Sequelize (`findAll`, `create`, `update`, `findOne`).
    * **Sincronización:** Usar `sequelize.sync({ force: true })` en desarrollo (`NODE_ENV=development`) para recrear tablas desde cero en cada inicio. En producción (`NODE_ENV=production`) usar `sequelize.sync()` sin opciones (solo crea tablas si no existen). **Prohibido usar `alter: true`**. A futuro, migrar a Sequelize CLI migrations para producción.
* **Gestor:** pnpm.
* **Puerto:** `PORT` (default: 3001).
* **Environment:** `dotenv`.
* **CORS:** Configurado en `src/app.js` con `cors`. Origen permitido vía `process.env.CORS_ORIGIN`. En desarrollo permitir `*`, en producción restringir al origen específico.

### Nota sobre Skills
Los archivos en `.agents/skills/` son material de referencia. En caso de conflicto, **AGENTS.md tiene prioridad**. Advertencias específicas:
* Los ejemplos de skills usan `require()` (CommonJS) — **adaptar siempre a `import/export` (ESM)**.
* Los ejemplos de skills pueden usar TypeScript — **adaptar siempre a JavaScript**.
* Los formatos de respuesta en skills pueden diferir — **seguir el formato estándar definido en este documento**.
* Los nombres de variables de entorno en skills pueden diferir — **usar `PG_*` según `.env`**.

## Reglas de Ejecución (CRÍTICO)

### 1. Política de Desarrollo Atómico (Nivel Máximo)

Para facilitar las revisiones, todo trabajo debe ser atómico:

* **Granularidad:** Nunca implementes múltiples tareas en un solo bloque. Si una feature tiene varios TODOs o pasos, **ejecuta solo uno a la vez**.
* **Proceso:**
    1.  Divide la tarea en pasos mínimos.
    2.  Presenta el plan.
    3.  Implementa **un solo paso**.
    4.  Espera mi revisión antes de continuar con el siguiente.
* **Objetivo:** Facilitar la revisión de código y asegurar que cada pieza funcione aislada.
* **Nota de Control**: Al finalizar cada paso atómico, siempre debes responder con: [PASO COMPLETADO] - ¿Procedemos con el siguiente: [Nombre del siguiente paso]? antes de esperar mi confirmación.


### 2. Normas Generales
* **Zero-Install Policy:** Prohibido instalar dependencias (`pnpm add`). Si es necesaria, notifícame primero.
* **Skill Awareness:** Revisa `src/` y este archivo antes de cada cambio.
* **Context Search:** Prioriza la consistencia con archivos existentes.
* **Database Safety:** Prohibido ejecutar comandos destructivos (`DROP`, `TRUNCATE`, `DELETE` masivos) sin confirmación explícita.
* **Language Bridge:**
    * Código (variables, funciones, rutas, tablas): **Inglés**.
    * Respuestas de API (messages): **Español**.
    * Mensajes de error y logs: **Español**.
    * Seed data / datos de ejemplo: **Español**.
* **Security:** Jamás imprimir ni pedir contenido del `.env`. Asume que las variables están en `process.env`.
* **Trackeo Inmediato:** Cada vez que se crea un archivo nuevo, ejecutar `git add <archivo>` inmediatamente. No esperar al final de una feature para trackear. Esto permite ver diffs en WebStorm y otros IDEs desde el momento de creación, facilitando la revisión.
* **Documentación Viva:** Cada feature, refactor o cambio significativo implementado debe reflejarse inmediatamente en `README.md`. Esto incluye: nuevos endpoints, cambios en la estructura del proyecto, nuevas dependencias, cambios en variables de entorno, etc. El README es el mapa actualizado del proyecto, no un documento post-mortem.

## Arquitectura en Capas (OBLIGATORIO)

Flujo estricto de dependencias:

```
Route → Controller → Service → Model
```

* **Routes:** Definen endpoints y aplican middlewares. Solo invocan controllers.
* **Controllers:** Reciben request/response, orquestan lógica. **Solo invocan services**, nunca modelos directamente. Usar **funciones exportadas** (no clases), más natural con ESM y JavaScript puro.
* **Services:** Contienen lógica de negocio. Invocan métodos de modelos Sequelize. Usar **funciones exportadas**.
* **Models:** Definiciones Sequelize. No contienen lógica de negocio.

**Prohibido:** Un controller que importe o use un modelo directamente.

**Escalabilidad:** Al escalar el proyecto, se puede incorporar una capa `Repository` (`src/repositories/*.repository.js`) entre Service y Model para abstraer el acceso a datos. Por ahora, Service invoca Model directamente.

## Convenciones de API

### Formato de Respuesta Estándar

Todas las respuestas deben seguir esta estructura:

**Éxito:**
```json
{
  "status": "success",
  "message": "Descripción de la operación exitosa en español",
  "data": { ... }
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Descripción del error en español"
}
```

**Error de validación (400):**
```json
{
  "status": "error",
  "message": "Error de validación",
  "errors": [
    { "field": "email", "message": "El email es obligatorio" }
  ]
}
```

**Respuesta paginada:**
```json
{
  "status": "success",
  "message": "Descripción en español",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Helper de Respuesta
Se recomienda usar un helper en `src/utils/response.js` para estandarizar todas las respuestas y evitar repetir manualmente la estructura JSON en cada controller:

```javascript
export const success = (res, { message, data, status = 200, pagination = null }) => { ... };
export const error = (res, { message, status = 500, errors = null }) => { ... };
```

### Códigos HTTP
* `200` - OK (GET, PUT)
* `201` - Created (POST)
* `400` - Bad Request (validación)
* `404` - Not Found
* `409` - Conflict (recurso duplicado)
* `500` - Internal Server Error

### Manejo de Errores Centralizado
* Todo error debe ser capturado y delegado a un middleware de error (`src/middlewares/error.middleware.js`).
* Los controllers/services deben usar `try/catch` y pasar el error via `next(error)`.
* No usar `res.status(500).json(...)` directamente en controllers.
* **Clases de error custom** (`src/utils/errors.js`): Definir `AppError`, `NotFoundError`, `ValidationError`, etc. Cada clase lleva su status code, permitiendo que el controller solo haga `throw new NotFoundError(...)` y el middleware mapee automáticamente el HTTP status.
* **`asyncHandler`** (`src/middlewares/asyncHandler.middleware.js`): Wrapper que captura errores async y los pasa a `next(error)`, eliminando `try/catch` repetitivo en cada controller.
* **Ocultar detalles en producción:** El middleware de error NO debe exponer stack traces ni detalles internos cuando `NODE_ENV=production`.
* **404 catch-all:** Todo request a ruta inexistente debe retornar `{ status: "error", message: "Ruta no encontrada" }` con status 404.

## Validación de Input

* Definir esquemas de validación en `src/middlewares/*.middleware.js`.
* Utilizar la librería que se acuerde al momento de necesitarla (notificar antes de instalar).
* Las validaciones se aplican como middlewares antes del controller.
* Todo endpoint que reciba body/params debe tener su middleware de validación.

## Convenciones de Git

* Los commits **solo se ejecutan cuando el usuario lo solicita explícitamente**.
* Formato: `<tipo>: <descripción en español>`. Tipos: `feat`, `fix`, `chore`, `docs`, `refactor`, `style`.
* Para reglas detalladas de agrupación y procedimiento, usar el comando `/autocommit`.

## Sequelize Tips

Al usar `include` con asociaciones, Sequelize anida los resultados. Para aplanar la respuesta:

```javascript
const usuarios = await Usuario.findAll({
  attributes: [
    'id',
    'nombre',
    [Sequelize.col('Perfil.bio'), 'bio'],
  ],
  include: [{
    model: Perfil,
    attributes: [],
  }],
  raw: true,
});
```

* `attributes: []` en el include evita columnas anidadas.
* `Sequelize.col('Modelo.columna')` trae la columna al nivel principal.
* `raw: true` aplana el objeto de Sequelize a JSON puro.

## Testing

* Framework a definir (notificar antes de instalar).
* Ubicación: `tests/` o `src/**/*.test.js` según convención acordada.
* Cobertura mínima: servicios y controladores críticos.

## Estructura de Proyecto
* **Entry:** `src/app.js`
* **Convención de Nombres (Sufijos):**
    * Rutas: `*.routes.js`
    * Controladores: `*.controller.js`
    * Middlewares: `*.middleware.js`
    * Configuraciones: `*.config.js`
    * Modelos: `src/models/*.model.js`
    * Servicios: `src/services/*.service.js` (Deben invocar métodos de los modelos de Sequelize).
    * Repositories: `src/repositories/*.repository.js` (Reservado para escalar. Por ahora no se usa).

## Comandos Útiles
* `pnpm dev`: Server con hot-reload (`node --watch`).
* `pnpm start`: Server producción.