
use('statzone');

/* limpieza */
db.partidos.drop();
db.jugadores.drop();
db.equipos.drop();

/* creacion de colecciones con validadores */

db.createCollection('equipos', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['nombre'],
      properties: {
        nombre: { bsonType: 'string', description: 'obligatorio' },
        ciudad: { bsonType: 'string' }
      }
    }
  }
});

db.createCollection('jugadores', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['nombre', 'equipoId'],
      properties: {
        nombre: { bsonType: 'string', description: 'obligatorio' },
        equipoId: { bsonType: 'objectId', description: 'referencia a equipos' },
        pos: { enum: ['POR', 'DEF', 'MED', 'DEL'] },
        goles: { bsonType: 'int', minimum: 0 }
      }
    }
  }
});

db.createCollection('partidos', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['localId', 'visitanteId', 'golesLocal', 'golesVisitante'],
      properties: {
        localId: { bsonType: 'objectId', description: 'referencia a equipos' },
        visitanteId: { bsonType: 'objectId', description: 'referencia a equipos' },
        golesLocal: { bsonType: 'int', minimum: 0 },
        golesVisitante: { bsonType: 'int', minimum: 0 },
        fecha: { bsonType: 'date' }
      }
    }
  }
});

/* indices */

/* indice de texto: busqueda con puntaje de relevancia */
db.jugadores.createIndex(
  { nombre: 'text' },
  { default_language: 'spanish', name: 'idx_texto_jugador' }
);

/* indice normal: busqueda incremental por prefijo */
db.jugadores.createIndex({ nombre: 1 }, { name: 'idx_nombre_jugador' });

/* acelera las agregaciones de la tabla de posiciones */
db.partidos.createIndex({ localId: 1 }, { name: 'idx_local' });
db.partidos.createIndex({ visitanteId: 1 }, { name: 'idx_visitante' });
db.jugadores.createIndex({ equipoId: 1 }, { name: 'idx_equipo_jugador' });

/* insercion de equipos */

const equipos = db.equipos.insertMany([
  { nombre: 'Halcones Norte',    ciudad: 'Aguascalientes' },
  { nombre: 'Deportivo Centro',  ciudad: 'Jesus Maria' },
  { nombre: 'Atletico Poniente', ciudad: 'Aguascalientes' },
  { nombre: 'Real Sur',          ciudad: 'Calvillo' },
  { nombre: 'Union Lagos',       ciudad: 'Rincon de Romos' },
  { nombre: 'Cuervos FC',        ciudad: 'Pabellon de Arteaga' }
]).insertedIds;

const halcones = equipos[0];
const centro   = equipos[1];
const poniente = equipos[2];
const sur      = equipos[3];
const lagos    = equipos[4];
const cuervos  = equipos[5];

/* insercion de jugadores */

db.jugadores.insertMany([
  { nombre: 'Mario Castaneda',    equipoId: halcones, pos: 'DEL', goles: 9 },
  { nombre: 'Ricardo Bonilla',    equipoId: halcones, pos: 'MED', goles: 3 },
  { nombre: 'Ivan Delgado',       equipoId: halcones, pos: 'DEF', goles: 1 },
  { nombre: 'Oscar Tapia',        equipoId: halcones, pos: 'POR', goles: 0 },

  { nombre: 'Julio Renteria',     equipoId: centro,   pos: 'DEL', goles: 7 },
  { nombre: 'Andres Machuca',     equipoId: centro,   pos: 'MED', goles: 4 },
  { nombre: 'Pablo Zavala',       equipoId: centro,   pos: 'DEF', goles: 0 },
  { nombre: 'Hugo Marin',         equipoId: centro,   pos: 'POR', goles: 0 },

  { nombre: 'Ana Palomino',       equipoId: poniente, pos: 'MED', goles: 6 },
  { nombre: 'Teresa Nunez',       equipoId: poniente, pos: 'DEL', goles: 5 },
  { nombre: 'Rocio Aguilar',      equipoId: poniente, pos: 'DEF', goles: 1 },
  { nombre: 'Carmen Solis',       equipoId: poniente, pos: 'POR', goles: 0 },

  { nombre: 'Luis Hernandez',     equipoId: sur,      pos: 'DEL', goles: 5 },
  { nombre: 'Emilio Cardona',     equipoId: sur,      pos: 'MED', goles: 2 },
  { nombre: 'Raul Miranda',       equipoId: sur,      pos: 'DEF', goles: 1 },
  { nombre: 'Gerardo Ponce',      equipoId: sur,      pos: 'POR', goles: 0 },

  { nombre: 'Sergio Vargas',      equipoId: lagos,    pos: 'DEL', goles: 4 },
  { nombre: 'Adrian Robles',      equipoId: lagos,    pos: 'MED', goles: 2 },
  { nombre: 'Fernando Quezada',   equipoId: lagos,    pos: 'DEF', goles: 0 },

  { nombre: 'Diego Salcedo',      equipoId: cuervos,  pos: 'DEL', goles: 3 },
  { nombre: 'Marco Villalobos',   equipoId: cuervos,  pos: 'MED', goles: 1 },
  { nombre: 'Alberto Ceballos',   equipoId: cuervos,  pos: 'POR', goles: 0 }
]);

/* insercion de partidos (7 jornadas) */

db.partidos.insertMany([
  { localId: halcones, visitanteId: sur,      golesLocal: 3, golesVisitante: 1, fecha: new Date('2026-06-06') },
  { localId: centro,   visitanteId: lagos,    golesLocal: 2, golesVisitante: 0, fecha: new Date('2026-06-06') },
  { localId: poniente, visitanteId: cuervos,  golesLocal: 1, golesVisitante: 1, fecha: new Date('2026-06-07') },

  { localId: sur,      visitanteId: centro,   golesLocal: 0, golesVisitante: 2, fecha: new Date('2026-06-13') },
  { localId: lagos,    visitanteId: poniente, golesLocal: 1, golesVisitante: 3, fecha: new Date('2026-06-13') },
  { localId: cuervos,  visitanteId: halcones, golesLocal: 0, golesVisitante: 4, fecha: new Date('2026-06-14') },

  { localId: halcones, visitanteId: centro,   golesLocal: 2, golesVisitante: 2, fecha: new Date('2026-06-20') },
  { localId: poniente, visitanteId: sur,      golesLocal: 2, golesVisitante: 1, fecha: new Date('2026-06-20') },
  { localId: lagos,    visitanteId: cuervos,  golesLocal: 1, golesVisitante: 2, fecha: new Date('2026-06-21') },

  { localId: centro,   visitanteId: poniente, golesLocal: 1, golesVisitante: 0, fecha: new Date('2026-06-27') },
  { localId: sur,      visitanteId: cuervos,  golesLocal: 3, golesVisitante: 0, fecha: new Date('2026-06-27') },
  { localId: halcones, visitanteId: lagos,    golesLocal: 5, golesVisitante: 1, fecha: new Date('2026-06-28') },

  { localId: cuervos,  visitanteId: centro,   golesLocal: 1, golesVisitante: 3, fecha: new Date('2026-07-04') },
  { localId: poniente, visitanteId: halcones, golesLocal: 0, golesVisitante: 1, fecha: new Date('2026-07-04') },
  { localId: lagos,    visitanteId: sur,      golesLocal: 2, golesVisitante: 2, fecha: new Date('2026-07-05') },

  { localId: halcones, visitanteId: cuervos,  golesLocal: 2, golesVisitante: 0, fecha: new Date('2026-07-11') },
  { localId: centro,   visitanteId: sur,      golesLocal: 2, golesVisitante: 1, fecha: new Date('2026-07-11') },
  { localId: poniente, visitanteId: lagos,    golesLocal: 4, golesVisitante: 0, fecha: new Date('2026-07-12') },

  { localId: sur,      visitanteId: halcones, golesLocal: 1, golesVisitante: 1, fecha: new Date('2026-07-18') },
  { localId: lagos,    visitanteId: centro,   golesLocal: 0, golesVisitante: 3, fecha: new Date('2026-07-18') },
  { localId: cuervos,  visitanteId: poniente, golesLocal: 1, golesVisitante: 2, fecha: new Date('2026-07-19') }
]);

/* verificacion */

print('equipos:   ' + db.equipos.countDocuments());
print('jugadores: ' + db.jugadores.countDocuments());
print('partidos:  ' + db.partidos.countDocuments());
