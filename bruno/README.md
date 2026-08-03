# Pruebas de API

Coleccion de solicitudes HTTP de StatZone para **Bruno**.

## Contenido

| Archivo | Descripcion |
|---|---|
| `bruno.json` | Definicion de la coleccion |
| `collection.bru` | Variable `base` con la URL del API |
| `StatZone/` | 22 solicitudes numeradas |

## Como abrirla

1. Abrir Bruno.
2. *Open Collection* y seleccionar la carpeta `bruno/`.
3. Verificar que el backend este corriendo en `http://localhost:3000`.

## Variables

Definidas en `collection.bru`:

| Variable | Valor |
|---|---|
| `base` | `http://localhost:3000/api` |

Algunas solicitudes usan `equipoId`, `otroEquipoId`, `jugadorId` y
`partidoId`. Hay que copiar identificadores reales obtenidos de *Listar
equipos*, *Listar jugadores* o *Listar partidos*.

## Orden sugerido

1. **Sembrar datos** — deja la base en un estado conocido.
2. **Consultas con relaciones** — tabla de posiciones y goleo.
3. **Implementacion avanzada** — busqueda por indice de texto.
4. **CRUD** — equipos, jugadores y partidos.
5. **Fin de temporada** — al final, porque elimina los partidos.

## Solicitudes

### Datos iniciales

| # | Solicitud | Metodo | Ruta |
|---|---|---|---|
| 01 | Sembrar datos | POST | `/seed` |

### Consultas con relaciones entre colecciones

| # | Solicitud | Metodo | Ruta |
|---|---|---|---|
| 02 | Tabla de posiciones | GET | `/tabla` |
| 03 | Tabla de goleo | GET | `/goleo` |

La solicitud 02 relaciona `equipos` con `partidos` para derivar la
clasificacion. La 03 relaciona `jugadores` con `equipos` para mostrar el
club de cada anotador. El objetivo de cada una esta documentado dentro de
la propia solicitud, en su seccion `docs`.

### Implementacion avanzada

| # | Solicitud | Metodo | Ruta |
|---|---|---|---|
| 04 | Buscar por indice de texto | GET | `/jugadores/buscar-texto?q=` |
| 05 | Buscar por prefijo | GET | `/jugadores/buscar?q=` |

La 04 devuelve un campo `score` calculado con `$meta: 'textScore'`, que es
la evidencia de que el indice de texto esta en uso.

### Equipos

| # | Solicitud | Metodo | Ruta |
|---|---|---|---|
| 06 | Listar equipos | GET | `/equipos` |
| 07 | Crear equipo | POST | `/equipos` |
| 08 | Actualizar equipo | PUT | `/equipos/:id` |
| 09 | Eliminar equipo | DELETE | `/equipos/:id` |
| 10 | Error: equipo sin nombre | POST | `/equipos` |

### Jugadores

| # | Solicitud | Metodo | Ruta |
|---|---|---|---|
| 11 | Listar jugadores | GET | `/jugadores` |
| 12 | Plantilla de un equipo | GET | `/jugadores/equipo/:equipoId` |
| 13 | Crear jugador | POST | `/jugadores` |
| 14 | Actualizar jugador | PUT | `/jugadores/:id` |
| 15 | Eliminar jugador | DELETE | `/jugadores/:id` |
| 16 | Error: goles excedidos | PUT | `/jugadores/:id` |
| 17 | Error: equipo inexistente | POST | `/jugadores` |

### Partidos

| # | Solicitud | Metodo | Ruta |
|---|---|---|---|
| 18 | Listar partidos | GET | `/partidos` |
| 19 | Crear partido | POST | `/partidos` |
| 20 | Eliminar partido | DELETE | `/partidos/:id` |
| 21 | Error: mismo equipo | POST | `/partidos` |

### Cierre de temporada

| # | Solicitud | Metodo | Ruta |
|---|---|---|---|
| 22 | Fin de temporada | POST | `/temporada/fin` |

## Casos de error incluidos

Las solicitudes 10, 16, 17 y 21 fallan a proposito. Sirven para comprobar
que las validaciones responden con 400 y un mensaje legible:

| # | Que valida |
|---|---|
| 10 | El nombre del equipo es obligatorio |
| 16 | Los goles de un jugador no rebasan los del equipo |
| 17 | El equipo referenciado debe existir |
| 21 | Un equipo no puede jugar contra si mismo |

## Capturas

Las capturas de las solicitudes en ejecucion estan en `capturas/`.
