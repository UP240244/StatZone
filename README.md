STATZONE

Sistema web para la gestion y consulta de estadisticas de una liga amateur
de futbol.

Bases de Datos Avanzadas — Universidad Politecnica de Aguascalientes
Tecnologias de la Informacion e Innovacion Digital — Grupo 5
Profesor: Juan Carlos Herrera Hernandez
Proyecto Final — Unidad 3

1. Integrantes

  a. Ábgel Iván García Salazar: UP240514
  b. Alison Tamara Romo Rodríguez: UP240244

2. Descripcion del proyecto

StatZone administra equipos, jugadores y resultados de partidos de una liga
amateur, y deriva automaticamente la tabla general de posiciones y el
liderato de goleo a partir de los encuentros registrados.

El principio de diseno central es que ningun dato derivado se almacena.
Los puntos, la diferencia de goles y la posicion de cada club no existen
como campos en la base de datos: se calculan en tiempo de consulta mediante
agregaciones sobre los partidos capturados. Esto hace imposible que la
clasificacion mostrada difiera de los resultados reales, un problema comun
cuando estas tablas se llevan manualmente en hojas de calculo.

Se eligio MongoDB por su modelo documental y por las capacidades de su
framework de agregacion, que permite resolver las relaciones entre
colecciones en una sola operacion mediante `$lookup`.

3. Tecnologias

  a. Base de datos: MongoDB
  b. Backend: NestJS + Mongoose
  c. Frontend: HTML, CSS Y JavaScript sin frameworks
  d. Pruebas de API: Bruno

4. Estructura del repositorio

```
stat-zone/
├── src/                    backend NestJS
│   ├── dto/                validaciones con class-validator
│   ├── equipos/            CRUD de equipos
│   ├── jugadores/          CRUD de jugadores y busquedas
│   ├── partidos/           CRUD de partidos
│   ├── stats/              consultas con relaciones y cierre de temporada
│   ├── seed/               carga de datos iniciales
│   ├── app.module.ts
│   └── main.ts
├── frontend/               interfaz web
├── database/               modelo de datos
├── bruno/                  coleccion de solicitudes HTTP
└── README.md
```

5. Documentacion por etapa

  a. Base de datos: [database/README.md](database/README.md)
  b. Backend: [src/README.md](src/README.md)
  c. Frontend: [frontend/README.md](frontend/README.md)
  d. Pruebas de API: [bruno/README.md](bruno/README.md)

6. Puesta en marcha

Requisitos: Node.js 20 o superior y MongoDB corriendo en el puerto 27017.

```bash
npm install
npm run start:dev
```

El API queda en `http://localhost:3000/api`.

Para cargar los datos de ejemplo (6 equipos, 22 jugadores y 21 partidos):

```
POST http://localhost:3000/api/seed
```

El frontend se abre directamente desde `frontend/index.html`, o con un
servidor local como Live Server.

7. Funcionalidades

  a. Gestion (altas, bajas y cambios)

  - Equipos: alta, edicion, y baja en cascada que elimina tambien sus
    jugadores y partidos.
  - Jugadores: alta, edicion y baja, con validacion de goles.
  - Partidos: registro de resultados y eliminacion.

  b. Consultas

  - Tabla general de posiciones calculada a partir de los partidos.
  - Tabla de goleo con el club de cada anotador.
  - Busqueda incremental de jugadores por prefijo.
  - Busqueda por indice de texto con puntaje de relevancia.

  c. Cierre de temporada

  Determina campeon, subcampeon y maximo goleador, elimina los partidos y
  reinicia los goles de los jugadores. Los equipos se conservan.

8. Consultas con relaciones entre colecciones

  a. Tabla de posiciones — `GET /api/tabla`

  Relaciona equipos con partidos mediante `$lookup` con subpipeline.
  
  Objetivo: derivar la clasificacion completa a partir de los resultados
  registrados, garantizando que no pueda existir inconsistencia entre los
  partidos capturados y los puntos mostrados.

  b. Tabla de goleo — `GET /api/goleo`

  Relaciona jugadores con equipos mediante `$lookup` por clave foranea.
  
  Objetivo: presentar a los maximos anotadores junto con el club al que
  pertenecen, sin duplicar el nombre del equipo en cada documento de jugador.
  
  El detalle de ambos pipelines esta documentado en
  [src/README.md](src/README.md).

9. Implementacion avanzada

  Busqueda de jugadores mediante indice de texto de MongoDB
  (`GET /api/jugadores/buscar-texto?q=`).
  
  A diferencia de una busqueda con `$regex`, un indice de texto invierte el
  contenido del campo en tokens, por lo que no recorre documento por
  documento. Ademas expone `$meta: 'textScore'`, un puntaje de relevancia que
  permite ordenar los resultados segun que tan bien coinciden con el termino
  buscado. El indice se declara con `default_language: 'spanish'`, lo que
  aplica las reglas de raiz del espanol e ignora sus palabras vacias.

10. Elemento innovador

  El cierre de temporada (`POST /api/temporada/fin`) no es una operacion
  CRUD: consume la propia agregacion de posiciones para determinar al campeon
  antes de ejecutar una operacion de mantenimiento sobre dos colecciones,
  eliminando los partidos y reiniciando los goles mientras conserva la
  configuracion de la liga. La interfaz muestra el palmares resultante con
  campeon, subcampeon y maximo goleador.

11. Reparto del trabajo

  a. Ángel Iván García Salazar: Creación del backend para jugadores, equipos y partidos. Creación de README's y realización de pruebas con capturas
  b. Alison Tamara Romo Rodríguez: Creación del frontend, dto, seed y stats además de la corrección de errores.
