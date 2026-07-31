import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Equipo } from '../equipos/equipo.schema';
import { Jugador } from '../jugadores/jugador.schema';

@Injectable()
export class StatsService {
constructor(
    @InjectModel(Equipo.name) private equipoModel: Model<Equipo>,
    @InjectModel(Jugador.name) private jugadorModel: Model<Jugador>,
) {}

/*
    CONSULTA 1: tabla de posiciones
    Relaciona: equipos  <->  partidos
*/
async tabla() {
    return this.equipoModel
    .aggregate([
        {
          // Trae los partidos donde el equipo jugo, sea de local o de
          // visitante, y los normaliza a goles a favor / goles en contra
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
            // 3 puntos por victoria, 1 por empate
            pts: { $add: [{ $multiply: ['$g', 3] }, '$e'] },
        },
        },
        { $sort: { pts: -1, dif: -1, nombre: 1 } },
    ])
    .exec();
}

/*
    CONSULTA 2: tabla de goleo
    Relaciona: jugadores  <->  equipos
*/
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
            equipo: '$club.nombre',
            ciudad: '$club.ciudad',
        },
        },
        { $sort: { goles: -1, nombre: 1 } },
        { $limit: 10 },
    ])
    .exec();
}
}