# Frontend

Interfaz web de StatZone. HTML, CSS y JavaScript sin frameworks ni proceso
de compilacion.

## Archivos

| Archivo | Contenido |
|---|---|
| `index.html` | Estructura de la pagina y los dos modales |
| `styles.css` | Estilos |
| `app.js` | Logica y consumo del API |

## Librerias empleadas

| Libreria | Uso |
|---|---|
| Fetch API (nativa) | Consumo del backend REST |
| IBM Plex Mono (Google Fonts) | Tipografia para cifras y estadisticas |

No se emplean frameworks. La interfaz se genera con JavaScript puro para
mantener el proyecto sin dependencias ni compilacion.

## Instalacion y ejecucion

No requiere instalacion. Basta con abrir `index.html` en el navegador.

Para servirlo desde un servidor local:

```bash
npx serve .
```

o bien la extension **Live Server** de Visual Studio Code.

## Configuracion

La unica linea que hay que ajustar esta al inicio de `app.js`:

```js
const API = 'http://localhost:3000/api';
```

## Modo demo

Si el backend no responde, la pagina funciona con datos en memoria y todas
las operaciones siguen siendo utilizables. Se pierden al recargar. Cuando el
backend responde, la variable `hayBackend` pasa a `true` de forma automatica
y cada boton envia su peticion HTTP real. El pie de pagina indica en cual de
los dos estados se encuentra.

## Funcionalidades

**Tabla general.** Muestra la clasificacion calculada por el backend. Un
clic sobre el nombre de un equipo abre su edicion; el boton `x` lo elimina.

**Jugadores.** Lista con altura fija y desplazamiento. Cada jugador tiene un
boton de edicion y uno de eliminacion. El buscador filtra por prefijo
conforme se escribe, con una espera de 300 ms para no enviar una peticion
por cada tecla.

**Registrar resultado.** Selecciona local y visitante, captura el marcador y
recalcula la tabla.

**Fin de temporada.** Pide confirmacion, cierra la competencia y muestra un
panel con el campeon, el subcampeon y el maximo goleador.

## Endpoints que consume

| Accion en la interfaz | Peticion |
|---|---|
| Carga de la tabla | `GET /api/tabla` |
| Carga de jugadores | `GET /api/jugadores` |
| Buscador | `GET /api/jugadores/buscar?q=` |
| Boton "+ Equipo" | `POST /api/equipos` |
| Clic en el nombre de un equipo | `PUT /api/equipos/:id` |
| Boton `x` en la tabla | `DELETE /api/equipos/:id` |
| Boton "+ Jugador" | `POST /api/jugadores` |
| Boton de edicion de jugador | `PUT /api/jugadores/:id` |
| Boton `x` en la lista de jugadores | `DELETE /api/jugadores/:id` |
| Boton "Guardar partido" | `POST /api/partidos` |
| Boton "Fin de temporada" | `POST /api/temporada/fin` |

## Contrato de datos

`GET /api/tabla` devuelve:

```json
[{ "_id": "...", "nombre": "Halcones Norte", "ciudad": "Aguascalientes",
   "pj": 7, "g": 6, "e": 1, "p": 0, "gf": 18, "gc": 5,
   "dif": 13, "pts": 19 }]
```

`GET /api/jugadores` y `GET /api/jugadores/buscar` devuelven:

```json
[{ "_id": "...", "nombre": "Mario Castaneda", "equipoId": "...",
   "equipo": "Halcones Norte", "pos": "DEL", "goles": 9 }]
```

Los nombres de los campos deben coincidir exactamente. Si una agregacion los
nombra distinto, conviene renombrarlos con un `$project` al final del
pipeline en lugar de modificar el frontend.

## Manejo de errores

Las peticiones que modifican datos pasan por la funcion `enviar()`, que lee
el mensaje devuelto por NestJS y lo muestra al usuario. Cuando el backend
rechaza una operacion, por ejemplo al asignar a un jugador mas goles de los
que anoto su equipo, el modal permanece abierto con los datos capturados
para poder corregirlos.

## Estructura de `app.js`

| Seccion | Contenido |
|---|---|
| 1 | Carga de datos y deteccion del backend |
| 2 | Pintado de la tabla y de la lista de jugadores |
| 3 | Apertura y cierre de modales |
| 4 | Equipos: alta, cambio y baja |
| 5 | Jugadores: alta, cambio y baja |
| 6 | Partidos |
| 7 | Fin de temporada |
| 8 | Buscador |
| 9 | Funciones de apoyo |

## Capturas de pantalla

Las capturas de la interfaz en ejecucion estan en `capturas/`.
