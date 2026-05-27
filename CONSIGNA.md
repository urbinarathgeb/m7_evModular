# Evaluación final del módulo 7

## API CRUD con PostgreSQL

### Objetivo
Desarrollar una API RESTful funcional que resuelva una problemática.

### Descripción
Los estudiantes deberán ser capaces de integrar los conocimientos vistos en clases construyendo una API RESTful que resuelva alguna problemática, utilizando una conexión a base de datos `PostgreSQL` y `Sequelize`.

### Instrucciones


#### 1- Descripción del proyecto

**Entregable:** Presentación en slides
- Explica el problema que resuelva la API.
- La temática es libre.
- Debe existir una relación muchos a muchos entre dos tablas. Cada tabla debe tener al menos 3 atributos incluyendo la clave primaria.
- Explica los casos de uso y beneficios de la API.


#### 2- Justificación del proyecto
**Entregable:** Presentación en slides
- Explica por qué usar `PostgreSQL`y `Sequelize`como ORM.
- Ventajas de la estructura RESTful para el manejo de datos.

#### 3- Creación del proyecto en `node.js` y `Express`
**Tareas:**
- Configurar el proyecto en modo desarrollo y producción.
- Crear el archivo `package.json`con las dependencias necesarias.
- Configurar `dontenv`para la gestión de variables de entorno.
- Crear el archivo `server.js`con la configuración básica de `Express`.
- Configurar `CORS`y `Middlewares`para el manejo de JSON.

#### 4- Configuración de PostgreSQL y Sequelize
**Tareas:**
- Configurar `Sequelñize`para conectar con PostgreSQL.
- Crear modelos con `Sequelize`.

#### 5- Implementación de los Endpoints CRUD
**Implementar los siguientes Endpoints:**
- **GET:** Obtener todos los elementos de una tabla:
- **GET:** Obtener un elemento específico mediante `ID`.
- **POST:** Agregar un nuevo elemento a la base de datos.
- **PUT:** Modificar un elemento existente de la base de datos.
- **DELETE:** Eliminar un elemento de la base de datos.
- Explicar cada método en una presentación de slides.

#### 6- Manejo de Códigos HTTP y errores
**Tareas:**
- Implementar códigos HTTP en cada endpoint (`res.status`).

#### 7- Pruebas y documentación
**Tareas:**
- Probar los endpoints con Postman.
- Explicar los resultados obtenidos en la presentación.

#### 8- Entregables finales
- 1. Presentación en slides con la descripción, justificación y explicación de los métodos `HTTP`.
- Repositorio en `Github`con el código del proyecto.
- Archivo `.env` para la configuración de `PostgreSQL`.
- Documentación de la `API` con ejemplos de peticiones y respuestas.
- Pruebas en Postman con capturas de pantalla.