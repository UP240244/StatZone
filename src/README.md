# Backend

API REST de StatZone desarrollada con NestJS y MongoDB.

## Librerias empleadas

| Libreria | Uso |
|---|---|
| `@nestjs/common`, `@nestjs/core` | Framework base |
| `@nestjs/mongoose`, `mongoose` | ODM y conexion a MongoDB |
| `class-validator`, `class-transformer` | Validacion de DTOs |
| `@nestjs/platform-express` | Servidor HTTP |

## Comandos de instalacion

```bash
npm install
```

Si se parte de un proyecto Nest limpio:

```bash
npm install @nestjs/mongoose mongoose class-validator class-transformer
```

## Comandos de ejecucion

```bash
npm run start:dev     # desarrollo con recarga automatica
npm run build         # compilar a dist/
npm run start:prod    # produccion
```

El API queda en `http://localhost:3000/api`.

Requiere MongoDB corriendo en el puerto 27017. La cadena de conexion esta
en `app.module.ts`.

## Estructura

```
src/
├── main.ts             prefijo global /api, CORS y ValidationPipe
├── app.module.ts       conexion a Mongo y registro de modulos
├── dto/                validaciones de entrada
├── equipos/            CRUD de equipos
├── jugadores/          CRUD de jugadores y busquedas
├── partidos/           CRUD de partidos
├── stats/              consultas con relaciones y cierre de temporada
└── seed/               carga de datos iniciales
```

Cada modulo agrupa su controller, service y schema. Es la organizacion
modular que recomienda NestJS: al modificar una funcionalidad se trabaja
sobre una sola carpeta.

`stats` y `seed` son modulos independientes porque ninguna de sus
operaciones pertenece a una sola coleccion.

## Endpoints

### Equipos

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/equipos` | Lista todos |
| GET | `/api/equipos/:id` | Un equipo |
| POST | `/api/equipos` | Alta |
| PUT | `/api/equipos/:id` | Cambio |
| DELETE | `/api/equipos/:id` | Baja en cascada |

### Jugadores

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/jugadores` | Lista todos con su equipo resuelto |
| GET | `/api/jugadores/buscar?q=` | Busqueda incremental por prefijo |
| GET | `/api/jugadores/buscar-texto?q=` | Busqueda por indice de texto |
| GET | `/api/jugadores/equipo/:equipoId` | Plantilla de un equipo |
| GET | `/api/jugadores/:id` | Un jugador |
| POST | `/api/jugadores` | Alta |
| PUT | `/api/jugadores/:id` | Cambio |
| DELETE | `/api/jugadores/:id` | Baja |

### Partidos

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/partidos` | Lista con nombres de equipo |
| POST | `/api/partidos` | Alta |
| DELETE | `/api/partidos/:id` | Baja |

### Estadisticas y temporada

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/tabla` | Tabla de posiciones |
| GET | `/api/goleo` | Tabla de goleo |
| POST | `/api/temporada/fin` | Cierre de temporada |

### Datos iniciales

| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/api/seed` | Carga los datos de ejemplo |

---

## Consultas con relaciones entre colecciones

### 1. Tabla de posiciones — `GET /api/tabla`

**Relaciona** `equipos` con `partidos` mediante `$lookup` con subpipeline.

**Objetivo:** derivar la clasificacion completa a partir de los resultados
registrados, en lugar de almacenar puntos y posiciones como campos. Ningun
dato calculado se guarda en la base, por lo que resulta imposible que la
tabla mostrada difiera de los partidos capturados.

**Como funciona:**

1. El pipeline parte de `equipos`. Por cada uno, el `$lookup` recupera los
   partidos donde aparece como local o como visitante.
2. Dentro del subpipeline, `$cond` normaliza cada encuentro a goles a favor
   y goles en contra desde la perspectiva de ese equipo. Este paso es
   necesario porque `partidos` referencia dos veces la misma coleccion.
3. `$filter` con `$size` cuenta victorias, empates y derrotas.
4. `$addFields` calcula la diferencia de goles y los puntos: 3 por victoria
   y 1 por empate.
5. `$sort` ordena por puntos, luego por diferencia y luego por nombre.

Se parte de `equipos` y no de `partidos` de forma intencional: asi un equipo
recien dado de alta aparece en la tabla con ceros en lugar de quedar fuera
de los resultados.

### 2. Tabla de goleo — `GET /api/goleo`

**Relaciona** `jugadores` con `equipos` mediante `$lookup` por clave
foranea.

**Objetivo:** presentar a los maximos anotadores junto con el club al que
pertenecen, sin duplicar el nombre del equipo dentro de cada documento de
jugador. El nombre del club vive en un solo lugar y la relacion se resuelve
en tiempo de consulta.

---

## Implementacion avanzada: indice de texto

`GET /api/jugadores/buscar-texto?q=`

El indice se declara en `src/jugadores/jugador.schema.ts`:

```ts
JugadorSchema.index(
  { nombre: 'text' },
  { default_language: 'spanish', name: 'idx_texto_jugador' },
);
```

Justificacion tecnica:

1. Un indice de texto invierte el contenido del campo en tokens, por lo que
   la busqueda no recorre documento por documento como si haria un `$regex`
   sin anclar.
2. `$meta: 'textScore'` devuelve un puntaje de relevancia por documento, lo
   que permite ordenar los resultados segun que tan bien coinciden con el
   termino buscado.
3. `default_language: 'spanish'` aplica las reglas de raiz del espanol e
   ignora sus palabras vacias.

Existe ademas `GET /api/jugadores/buscar?q=`, que resuelve el autocompletado
incremental de la interfaz con una regex anclada al inicio. Son tecnicas
complementarias: `$text` opera sobre palabras completas y devuelve
relevancia, por lo que no puede resolver una busqueda por prefijo parcial.

---

## Cierre de temporada

`POST /api/temporada/fin`

No es una operacion CRUD. Consume la propia agregacion de posiciones para
determinar al campeon y ejecuta una operacion de mantenimiento sobre dos
colecciones:

1. Calcula la clasificacion y obtiene campeon y subcampeon.
2. Obtiene al maximo goleador **antes** de modificar nada.
3. Elimina todos los partidos.
4. Reinicia a cero los goles de todos los jugadores.
5. Devuelve el palmares de la temporada cerrada.

Los equipos se conservan, de modo que la liga queda lista para una nueva
temporada sin volver a capturar su configuracion. La operacion se rechaza
si no hay partidos registrados.

---

## Validaciones

Se aplican con `class-validator` sobre los DTOs y un `ValidationPipe` global
con `whitelist: true`, que descarta cualquier campo no declarado en el DTO.

| Validacion | Donde |
|---|---|
| Nombre de equipo y jugador obligatorio | DTO |
| `equipoId`, `localId` y `visitanteId` deben ser ObjectId validos | DTO |
| Los goles no pueden ser negativos | DTO y schema |
| La posicion debe ser POR, DEF, MED o DEL | DTO y schema |
| Un equipo no puede jugar contra si mismo | Servicio |
| Los equipos referenciados deben existir | Servicio |
| Los goles de los jugadores de un equipo no rebasan los del equipo | Servicio |

La ultima merece explicacion: al dar de alta o editar un jugador se calcula
cuantos goles anoto su equipo segun los partidos registrados, se resta lo
ya repartido entre sus companeros, y el resto es el maximo admisible. Al
editar se excluye al propio jugador del conteo para que no se bloquee a si
mismo.

---

## Detalles de implementacion

**Conversion de identificadores.** Los `_id` que llegan del frontend son
cadenas de texto. Mongoose los convierte automaticamente en `findById`,
`findByIdAndUpdate` y `findByIdAndDelete`, pero no al construir un
documento nuevo ni en `find`, `deleteMany` o `aggregate`. En esos casos hay
que convertirlos con `new Types.ObjectId(id)`, o quedan guardados como
cadena y el `$lookup` no los relaciona con la coleccion `equipos`.

**Orden de las rutas.** `@Get('buscar')` y `@Get('buscar-texto')` se
declaran antes que `@Get(':id')`. De lo contrario Nest interpreta "buscar"
como un identificador.

**Query contra parametro de ruta.** El termino de busqueda viaja en la query
string, por lo que se lee con `@Query('q')` y no con `@Param`.

**Borrado en cascada.** Al eliminar un equipo se borran sus jugadores y los
partidos en los que participo. Sin esto quedarian documentos apuntando a un
equipo inexistente y el `$unwind` de las agregaciones los descartaria en
silencio.
