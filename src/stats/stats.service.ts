import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Equipo } from '../equipos/equipos.schema';
import { Jugador } from '../jugadores/jugador.schema';
import { Partido } from '../partidos/partido.schema';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Equipo.name) private equipoModel: Model<Equipo>,
    @InjectModel(Jugador.name) private jugadorModel: Model<Jugador>,
    @InjectModel(Partido.name) private partidoModel: Model<Partido>,
  ) {}

  /* CONSULTA 1: tabla de posiciones
     Relaciona equipos con partidos. */
  async tabla() {
    return this.equipoModel
      .aggregate([
        {
          /* trae los partidos donde el equipo jugo, sea de local o de
             visitante, y los normaliza a goles a favor / en contra */
          $lookup: {
            from: 'partidos',
            let: { equipo: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ['$localId', '$$equipo'] },
                      { $eq: ['$visitanteId', '$$equipo'] },
                    ],
                  },
                },
              },
              {
                $project: {
                  gf: {
                    $cond: [
                      { $eq: ['$localId', '$$equipo'] },
                      '$golesLocal',
                      '$golesVisitante',
                    ],
                  },
                  gc: {
                    $cond: [
                      { $eq: ['$localId', '$$equipo'] },
                      '$golesVisitante',
                      '$golesLocal',
                    ],
                  },
                },
              },
            ],
            as: 'juegos',
          },
        },
        {
          $project: {
            nombre: 1,
            ciudad: 1,
            pj: { $size: '$juegos' },
            g: {
              $size: {
                $filter: {
                  input: '$juegos',
                  as: 'j',
                  cond: { $gt: ['$$j.gf', '$$j.gc'] },
                },
              },
            },
            e: {
              $size: {
                $filter: {
                  input: '$juegos',
                  as: 'j',
                  cond: { $eq: ['$$j.gf', '$$j.gc'] },
                },
              },
            },
            p: {
              $size: {
                $filter: {
                  input: '$juegos',
                  as: 'j',
                  cond: { $lt: ['$$j.gf', '$$j.gc'] },
                },
              },
            },
            gf: { $sum: '$juegos.gf' },
            gc: { $sum: '$juegos.gc' },
          },
        },
        {
          $addFields: {
            dif: { $subtract: ['$gf', '$gc'] },
            /* 3 puntos por victoria, 1 por empate */
            pts: { $add: [{ $multiply: ['$g', 3] }, '$e'] },
          },
        },
        { $sort: { pts: -1, dif: -1, nombre: 1 } },
      ])
      .exec();
  }

  /* CONSULTA 2: tabla de goleo
     Relaciona jugadores con equipos. */
  async goleo() {
    return this.jugadorModel
      .aggregate([
        { $match: { goles: { $gt: 0 } } },
        {
          $lookup: {
            from: 'equipos',
            localField: 'equipoId',
            foreignField: '_id',
            as: 'club',
          },
        },
        { $unwind: '$club' },
        {
          $project: {
            nombre: 1,
            pos: 1,
            goles: 1,
            equipoId: 1,
            equipo: '$club.nombre',
            ciudad: '$club.ciudad',
          },
        },
        { $sort: { goles: -1, nombre: 1 } },
        { $limit: 10 },
      ])
      .exec();
  }

  /* CIERRE DE TEMPORADA
     Determina al campeon, lo devuelve y reinicia la competencia: se borran
     los partidos y los goles de los jugadores vuelven a cero. Los equipos
     permanecen registrados. */
  async finTemporada() {
    const clasificacion = await this.tabla();

    if (clasificacion.length === 0) {
      throw new BadRequestException('No hay equipos registrados');
    }

    const partidosJugados = await this.partidoModel.countDocuments();
    if (partidosJugados === 0) {
      throw new BadRequestException(
        'No se puede cerrar la temporada sin partidos registrados',
      );
    }

    const campeon = clasificacion[0];
    const subcampeon = clasificacion[1] ?? null;

    /* el goleador se calcula antes de reiniciar */
    const goleadores = await this.goleo();
    const goleador = goleadores[0] ?? null;

    await this.partidoModel.deleteMany({});
    await this.jugadorModel.updateMany({}, { $set: { goles: 0 } });

    return {
      ok: true,
      campeon: {
        nombre: campeon.nombre,
        ciudad: campeon.ciudad,
        pts: campeon.pts,
        pj: campeon.pj,
        g: campeon.g,
        e: campeon.e,
        p: campeon.p,
        dif: campeon.dif,
      },
      subcampeon: subcampeon
        ? { nombre: subcampeon.nombre, pts: subcampeon.pts }
        : null,
      goleador: goleador
        ? {
            nombre: goleador.nombre,
            equipo: goleador.equipo,
            goles: goleador.goles,
          }
        : null,
      partidosBorrados: partidosJugados,
    };
  }
}