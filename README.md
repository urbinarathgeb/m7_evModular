# Documento Maestro: CutLog API

## 1. Visión y Propósito

**CutLog API** es un asistente de producción _Just-in-Time_ diseñado para aserraderos. Su misión es eliminar la
carga mental del operario y garantizar la trazabilidad mediante la gestión precisa de pedidos.

### Objetivos Clave:

- **Eliminar la ambigüedad:** Evitar que el operario olvide las medidas o la configuración de apilado (piezas, filas,
  separadores).

- **Gestión de Pedidos:** Control total sobre qué falta producir para satisfacer la demanda real del cliente.

- **Trazabilidad Extrema:** Registro histórico inmutable de cómo se configuró cada paquete.

- **Simplicidad Operativa:** Registro rápido mediante valores sugeridos con libertad total para realizar ajustes
  manuales ("Override").

## 2. Filosofía del Sistema

- **Pedido-Céntrico:** El sistema no busca llenar un inventario infinito; solo existe para cumplir órdenes de venta.

- **Agnosticismo del Material:** El sistema no depende del tipo de madera. La unidad de trabajo es la **Escuadría (
  Dimensiones)**.

- **Flexibilidad (Default vs. Override):** Se estandariza el trabajo para el 90% de los casos, pero se permite la
  personalización total para el 10% de pedidos especiales.

## 3. Arquitectura de Datos (Modelo Relacional)

Para permitir órdenes mixtas (múltiples medidas en un mismo pedido), la base de datos se organiza así:

| **Entidad**       | **Propósito**                                                        |
|-------------------|----------------------------------------------------------------------|
| **Escuadría**     | Catálogo base de medidas físicas (ej: 18x90x3000).                   |
| **Configuración** | Receta técnica: Ancho, Alto, Cantidad de separadores.                |
| **Orden**         | Contenedor maestro: Vincula cliente, fecha y estado global.          |
| **DetalleOrden**  | "Items" de la orden: Define cuánto producir de cada escuadría.       |
| **Paquete**       | Registro único de producción. "Congela" la configuración real usada. |

## 4. Lógica de Negocio y Reglas de Operación

1. **Jerarquía Independiente:** Las dimensiones (Escuadría) existen separadas de su receta de apilado.

2. **Carga Inteligente:** Al crear un `DetalleOrden`, el sistema autocompleta la configuración basándose en el estándar
   de la `Escuadría`.

3. **Inmutabilidad (Regla de Oro):** Una vez que un paquete es producido, su configuración queda registrada
   permanentemente. Cambios futuros en el "estándar" no alteran el histórico.

4. **Flujo del Pedido:**

    - **Pendiente:** Orden ingresada, sin avance.

    - **En Producción:** Se están registrando los paquetes uno a uno.

    - **Finalizado:** La cantidad producida iguala la solicitada.

    - **Entregado:** El paquete sale del aserradero (cierre de ciclo).

5. **Resiliencia:** Capacidad de "Anular Producción" para corregir errores antes del despacho.

## 5. El Flujo Operativo (La "Receta" en Acción)

1. **Ingreso:** El sistema permite cargar una `Orden` con múltiples líneas (`DetalleOrden`), ejemplo: _5 paquetes de
   18x90x3600_ + _10 paquetes de 10x10x1800_.

2. **Decisión de Campo:**

    - Si es **estándar**, el operario confirma la configuración propuesta.

    - Si es **especial**, el operario modifica los campos (ej: de 2 a 3 separadores) en el momento.

3. **Registro:** Al presionar "Registrar Paquete", se genera un ID único, se vincula a la `Orden` y se guarda la "foto"
   de la configuración aplicada.

4. **Feedback Visual:** El tablero muestra el progreso real: `Producido 2/5` para la primera medida y `0/10` para la
   segunda.

## 6. Tablero del Operario (Visualización)

| **Orden** | **Producto (Medida)** | **Objetivo** | **Producido** | **Estado**    |
|-----------|-----------------------|--------------|---------------|---------------|
| **#101**  | 18x90x3600            | 5 Pqts       | 2             | 🟡 En proceso |
| **#101**  | 10x10x1800            | 10 Pqts      | 0             | 🔴 Pendiente  |

- **Ayuda Visual:** Al tocar cualquier ítem, la pantalla muestra la receta técnica (esquema de apilado) para asegurar
  que el armado sea correcto.

Este diseño consolida la agilidad técnica de una API moderna con la realidad práctica de un aserradero. **¿Consideras
que este documento ya abarca todo lo necesario para comenzar a definir los endpoints y la estructura del código?**