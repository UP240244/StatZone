import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Equipo } from '../equipos/schemas/equipo.schema';
import { Jugador } from '../jugadores/schemas/jugador.schema';
import { Partido } from '../partidos/schemas/partido.schema';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Equipo.name) private equipoModel: Model<Equipo>,
    @InjectModel(Jugador.name) private jugadorModel: Model<Jugador>,
    @InjectModel(Partido.name) private partidoModel: Model<Partido>,
  ) {}

  async sembrar() {
    await this.equipoModel.deleteMany({});
    await this.jugadorModel.deleteMany({});
    await this.partidoModel.deleteMany({});

    const equipos = await this.equipoModel.insertMany([
      { nombre: 'Halcones Norte', ciudad: 'Aguascalientes' },
      { nombre: 'Deportivo Centro', ciudad: 'Jesus Maria' },
      { nombre: 'Atletico Poniente', ciudad: 'Aguascalientes' },
      { nombre: 'Real Sur', ciudad: 'Calvillo' },
      { nombre: 'Union Lagos', ciudad: 'Rincon de Romos' },
      { nombre: 'Cuervos FC', ciudad: 'Pabellon de Arteaga' },
    ]);

    // El orden importa: los partidos de abajo usan estos indices
    const halcones = equipos[0]._id;
    const centro = equipos[1]._id;
    const poniente = equipos[2]._id;
    const sur = equipos[3]._id;
    const lagos = equipos[4]._id;
    const cuervos = equipos[5]._id;

    await this.jugadorModel.insertMany([
      { nombre: 'Mario Castaneda', equipoId: halcones, pos: 'DEL', goles: 9 },
      { nombre: 'Ricardo Bonilla', equipoId: halcones, pos: 'MED', goles: 3 },
      { nombre: 'Ivan Delgado', equipoId: halcones, pos: 'DEF', goles: 1 },
      { nombre: 'Oscar Tapia', equipoId: halcones, pos: 'POR', goles: 0 },

      { nombre: 'Julio Renteria', equipoId: centro, pos: 'DEL', goles: 7 },
      { nombre: 'Andres Machuca', equipoId: centro, pos: 'MED', goles: 4 },
      { nombre: 'Pablo Zavala', equipoId: centro, pos: 'DEF', goles: 0 },
      { nombre: 'Hugo Marin', equipoId: centro, pos: 'POR', goles: 0 },

      { nombre: 'Ana Palomino', equipoId: poniente, pos: 'MED', goles: 6 },
      { nombre: 'Teresa Nunez', equipoId: poniente, pos: 'DEL', goles: 5 },
      { nombre: 'Rocio Aguilar', equipoId: poniente, pos: 'DEF', goles: 1 },
      { nombre: 'Carmen Solis', equipoId: poniente, pos: 'POR', goles: 0 },

      { nombre: 'Luis Hernandez', equipoId: sur, pos: 'DEL', goles: 5 },
      { nombre: 'Emilio Cardona', equipoId: sur, pos: 'MED', goles: 2 },
      { nombre: 'Raul Miranda', equipoId: sur, pos: 'DEF', goles: 1 },
      { nombre: 'Gerardo Ponce', equipoId: sur, pos: 'POR', goles: 0 },

      { nombre: 'Sergio Vargas', equipoId: lagos, pos: 'DEL', goles: 4 },
      { nombre: 'Adrian Robles', equipoId: lagos, pos: 'MED', goles: 2 },
      { nombre: 'Fernando Quezada', equipoId: lagos, pos: 'DEF', goles: 0 },

      { nombre: 'Diego Salcedo', equipoId: cuervos, pos: 'DEL', goles: 3 },
      { nombre: 'Marco Villalobos', equipoId: cuervos, pos: 'MED', goles: 1 },
      { nombre: 'Alberto Ceballos', equipoId: cuervos, pos: 'POR', goles: 0 },
    ]);

    await this.partidoModel.insertMany([
      // Jornada 1
      { localId: halcones, visitanteId: sur, golesLocal: 3, golesVisitante: 1, fecha: new Date('2026-06-06') },
      { localId: centro, visitanteId: lagos, golesLocal: 2, golesVisitante: 0, fecha: new Date('2026-06-06') },
      { localId: poniente, visitanteId: cuervos, golesLocal: 1, golesVisitante: 1, fecha: new Date('2026-06-07') },
      // Jornada 2
      { localId: sur, visitanteId: centro, golesLocal: 0, golesVisitante: 2, fecha: new Date('2026-06-13') },
      { localId: lagos, visitanteId: poniente, golesLocal: 1, golesVisitante: 3, fecha: new Date('2026-06-13') },
      { localId: cuervos, visitanteId: halcones, golesLocal: 0, golesVisitante: 4, fecha: new Date('2026-06-14') },
      // Jornada 3
      { localId: halcones, visitanteId: centro, golesLocal: 2, golesVisitante: 2, fecha: new Date('2026-06-20') },
      { localId: poniente, visitanteId: sur, golesLocal: 2, golesVisitante: 1, fecha: new Date('2026-06-20') },
      { localId: lagos, visitanteId: cuervos, golesLocal: 1, golesVisitante: 2, fecha: new Date('2026-06-21') },
      // Jornada 4
      { localId: centro, visitanteId: poniente, golesLocal: 1, golesVisitante: 0, fecha: new Date('2026-06-27') },
      { localId: sur, visitanteId: cuervos, golesLocal: 3, golesVisitante: 0, fecha: new Date('2026-06-27') },
      { localId: halcones, visitanteId: lagos, golesLocal: 5, golesVisitante: 1, fecha: new Date('2026-06-28') },
      // Jornada 5
      { localId: cuervos, visitanteId: centro, golesLocal: 1, golesVisitante: 3, fecha: new Date('2026-07-04') },
      { localId: poniente, visitanteId: halcones, golesLocal: 0, golesVisitante: 1, fecha: new Date('2026-07-04') },
      { localId: lagos, visitanteId: sur, golesLocal: 2, golesVisitante: 2, fecha: new Date('2026-07-05') },
      // Jornada 6
      { localId: halcones, visitanteId: cuervos, golesLocal: 2, golesVisitante: 0, fecha: new Date('2026-07-11') },
      { localId: centro, visitanteId: sur, golesLocal: 2, golesVisitante: 1, fecha: new Date('2026-07-11') },
      { localId: poniente, visitanteId: lagos, golesLocal: 4, golesVisitante: 0, fecha: new Date('2026-07-12') },
      // Jornada 7
      { localId: sur, visitanteId: halcones, golesLocal: 1, golesVisitante: 1, fecha: new Date('2026-07-18') },
      { localId: lagos, visitanteId: centro, golesLocal: 0, golesVisitante: 3, fecha: new Date('2026-07-18') },
      { localId: cuervos, visitanteId: poniente, golesLocal: 1, golesVisitante: 2, fecha: new Date('2026-07-19') },
    ]);

    return {
      ok: true,
      equipos: equipos.length,
      jugadores: await this.jugadorModel.countDocuments(),
      partidos: await this.partidoModel.countDocuments(),
    };
  }
}
