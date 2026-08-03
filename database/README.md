# Base de datos

Modelo de datos de StatZone sobre MongoDB.

## Motor y conexion

| | |
|---|---|
| Motor | MongoDB 8 |
| Base de datos | `statzone` |
| Cadena de conexion | `mongodb://127.0.0.1:27017/statzone` |

> En Windows se usa `127.0.0.1` en lugar de `localhost` para evitar el
> retraso que introduce la resolucion por IPv6.

MongoDB crea la base de datos y las colecciones de forma implicita al
insertar el primer documento, por lo que no existe un script equivalente a
un `CREATE DATABASE`. La estructura se define mediante los esquemas de
Mongoose descritos mas abajo, que ademas validan los documentos antes de
escribirlos.

## Diagrama del modelo

![Modelo de datos](modelo-relacional.png)

```
┌─────────────────────────┐
│        equipos          │
├─────────────────────────┤
│ _id       ObjectId  PK  │
│ nombre    String    req │
│ ciudad    String        │
└─────────────────────────┘
      ▲                ▲
      │ 1              │ 1
      │                │
      │ N              │ N (localId, visitanteId)
┌─────────────────────┐ │ ┌──────────────────────────────┐
│      jugadores      │ │ │           partidos           │
├─────────────────────┤ │ ├──────────────────────────────┤
│ _id      ObjectId PK│ │ │ _id             ObjectId  PK │
│ nombre   String  req│ │ │ localId         ObjectId  FK │
│ equipoId ObjectId FK│─┘ │ visitanteId     ObjectId  FK │
│ pos      String  enum   │ golesLocal      Number   req │
│ goles    Number  min 0  │ golesVisitante  Number   req │
└─────────────────────┘   │ fecha           Date         │
                          └──────────────────────────────┘
```

## Colecciones

### equipos

| Campo | Tipo | Restricciones |
|---|---|---|
| `_id` | ObjectId | Clave primaria |
| `nombre` | String | Obligatorio |
| `ciudad` | String | Opcional |

### jugadores

| Campo | Tipo | Restricciones |
|---|---|---|
| `_id` | ObjectId | Clave primaria |
| `nombre` | String | Obligatorio |
| `equipoId` | ObjectId | Referencia a `equipos`, obligatorio |
| `pos` | String | POR, DEF, MED o DEL |
| `goles` | Number | Minimo 0 |

### partidos

| Campo | Tipo | Restricciones |
|---|---|---|
| `_id` | ObjectId | Clave primaria |
| `localId` | ObjectId | Referencia a `equipos`, obligatorio |
| `visitanteId` | ObjectId | Referencia a `equipos`, obligatorio |
| `golesLocal` | Number | Obligatorio, minimo 0 |
| `golesVisitante` | Number | Obligatorio, minimo 0 |
| `fecha` | Date | Por defecto la fecha actual |

## Relaciones

| Relacion | Cardinalidad | Implementacion |
|---|---|---|
| equipos → jugadores | 1 a N | `jugadores.equipoId` |
| equipos → partidos | 1 a N (dos veces) | `partidos.localId` y `partidos.visitanteId` |

Un partido referencia dos veces la misma coleccion, una por cada equipo que
participa. Esta es la razon por la que la tabla de posiciones requiere un
`$lookup` con subpipeline en lugar de uno simple por clave foranea: hay que
evaluar ambos campos y normalizar los goles segun el equipo desde el que se
consulta.

## Decision de diseno: ningun dato derivado se almacena

Los puntos, la posicion, los partidos jugados y la diferencia de goles **no
existen como campos** en la coleccion `equipos`. Se calculan en tiempo de
consulta a partir de `partidos`.

La alternativa habria sido guardar un campo `pts` en cada equipo y
actualizarlo al registrar cada resultado. Se descarto porque introduce
redundancia: si una escritura falla o un partido se corrige, la tabla queda
desincronizada de los resultados reales. Al derivarla siempre de los
partidos, esa inconsistencia es imposible por construccion.

El costo es que cada consulta a la tabla ejecuta la agregacion completa. Con
el volumen de una liga amateur es irrelevante, y a cambio se elimina toda
una clase de errores de integridad.

## Indices

| Coleccion | Indice | Proposito |
|---|---|---|
| `jugadores` | `{ nombre: 'text' }` | Busqueda por indice de texto con puntaje de relevancia. Se declara con `default_language: 'spanish'`. |
| `jugadores` | `{ nombre: 1 }` | Busqueda incremental por prefijo. |

Ambos se declaran en `src/jugadores/jugador.schema.ts` y Mongoose los crea
automaticamente al iniciar la aplicacion.

## Integridad referencial

MongoDB no impone claves foraneas, por lo que la integridad se aplica desde
la capa de servicio:

- Antes de dar de alta un jugador o un partido se verifica que los equipos
  referenciados existan.
- Al eliminar un equipo se borran en cascada sus jugadores y los partidos
  en los que participo, evitando documentos huerfanos que romperian las
  agregaciones.
- Un partido no puede registrarse con el mismo equipo como local y
  visitante.
- La suma de goles de los jugadores de un equipo no puede rebasar los goles
  que ese equipo anoto segun los partidos registrados.

## Scripts

| Archivo | Contenido |
|---|---|
| `statzone-init.js` | Creacion de colecciones con validadores, indices e insercion de registros de ejemplo. Se ejecuta con `mongosh`. |

```bash
mongosh < database/statzone-init.js
```

La aplicacion tambien expone la carga de datos como endpoint, que es la via
usada durante el desarrollo:

```
POST http://localhost:3000/api/seed
```

Ambas rutas producen el mismo estado inicial: 6 equipos, 22 jugadores y 21
partidos distribuidos en 7 jornadas.
