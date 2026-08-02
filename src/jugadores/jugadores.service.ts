import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Jugador } from './jugador.schema';
import { Equipo } from '../equipos/equipos.schema';
import { Partido } from '../partidos/partido.schema';
import { CreateJugadorDto } from '../dto/create-jugador.dto';
import { UpdateJugadorDto } from '../dto/update-jugador.dto';

@Injectable()
export class JugadoresService {
  constructor(
    @InjectModel(Jugador.name) private jugadorModel: Model<Jugador>,
    @InjectModel(Equipo.name) private equipoModel: Model<Equipo>,
    @InjectModel(Partido.name) private partidoModel: Model<Partido>,
  ) {}

  async listar() {
    return this.jugadorModel
      .aggregate([
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
          },
        },
        { $sort: { goles: -1, nombre: 1 } },
      ])
      .exec();
  }

  async uno(id: string) {
    const jugador = await this.jugadorModel.findById(id).exec();
    if (!jugador) {
      throw new NotFoundException('Jugador no encontrado');
    }
    return jugador;
  }

  /* Goles que el equipo ha anotado segun los partidos registrados.
     Es el tope para la suma de goles de sus jugadores. */
  async golesDelEquipo(equipoId: Types.ObjectId): Promise<number> {
    const resultado = await this.partidoModel
      .aggregate([
        {
          $match: {
            $or: [{ localId: equipoId }, { visitanteId: equipoId }],
          },
        },
        {
          $project: {
            gf: {
              $cond: [
                { $eq: ['$localId', equipoId] },
                '$golesLocal',
                '$golesVisitante',
              ],
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$gf' } } },
      ])
      .exec();

    return resultado.length > 0 ? resultado[0].total : 0;
  }

  /* Goles ya repartidos entre los jugadores del equipo,
     excluyendo opcionalmente a un jugador (el que se esta editando). */
  async golesAsignados(
    equipoId: Types.ObjectId,
    excluirJugadorId?: string,
  ): Promise<number> {
    const filtro: any = { equipoId: equipoId };
    if (excluirJugadorId) {
      filtro._id = { $ne: new Types.ObjectId(excluirJugadorId) };
    }

    const jugadores = await this.jugadorModel.find(filtro).exec();

    let suma = 0;
    for (let i = 0; i < jugadores.length; i++) {
      suma = suma + jugadores[i].goles;
    }
    return suma;
  }

  /* Valida que los goles del jugador no rebasen lo que el equipo anoto */
  async validarGoles(
    equipoId: Types.ObjectId,
    goles: number,
    excluirJugadorId?: string,
  ) {
    const golesEquipo = await this.golesDelEquipo(equipoId);
    const yaAsignados = await this.golesAsignados(equipoId, excluirJugadorId);
    const disponibles = golesEquipo - yaAsignados;

    if (goles > disponibles) {
      throw new BadRequestException(
        'El equipo lleva ' +
          golesEquipo +
          ' goles y ya tiene ' +
          yaAsignados +
          ' repartidos entre sus jugadores. El maximo para este jugador es ' +
          disponibles +
          '.',
      );
    }
  }

  async crear(dto: CreateJugadorDto) {
    const equipo = await this.equipoModel.findById(dto.equipoId).exec();
    if (!equipo) {
      throw new BadRequestException('El equipo indicado no existe');
    }

    /* el id llega como string desde el frontend; hay que convertirlo a
       ObjectId o el $lookup no lo relaciona con equipos */
    const equipoId = new Types.ObjectId(dto.equipoId);
    const goles = dto.goles ?? 0;

    if (goles > 0) {
      await this.validarGoles(equipoId, goles);
    }

    const nuevo = new this.jugadorModel({
      nombre: dto.nombre,
      equipoId: equipoId,
      pos: dto.pos ?? 'MED',
      goles: goles,
    });
    return nuevo.save();
  }

  async actualizar(id: string, dto: UpdateJugadorDto) {
    const jugador = await this.jugadorModel.findById(id).exec();
    if (!jugador) {
      throw new NotFoundException('Jugador no encontrado');
    }

    // Si cambia de equipo se valida contra el nuevo, si no contra el actual
    let equipoId = jugador.equipoId;

    if (dto.equipoId) {
      const equipo = await this.equipoModel.findById(dto.equipoId).exec();
      if (!equipo) {
        throw new BadRequestException('El equipo indicado no existe');
      }
      equipoId = new Types.ObjectId(dto.equipoId);
    }

    if (dto.goles !== undefined && dto.goles > 0) {
      await this.validarGoles(equipoId, dto.goles, id);
    }

    const cambios: any = {};
    if (dto.nombre !== undefined) cambios.nombre = dto.nombre;
    if (dto.pos !== undefined) cambios.pos = dto.pos;
    if (dto.goles !== undefined) cambios.goles = dto.goles;
    if (dto.equipoId !== undefined) cambios.equipoId = equipoId;

    const actualizado = await this.jugadorModel
      .findByIdAndUpdate(id, cambios, { new: true })
      .exec();

    return actualizado;
  }

  async eliminar(id: string) {
    const borrado = await this.jugadorModel.findByIdAndDelete(id).exec();
    if (!borrado) {
      throw new NotFoundException('Jugador no encontrado');
    }
    return { ok: true, mensaje: 'Jugador eliminado' };
  }

  /* Busqueda incremental por prefijo. $text trabaja con palabras
     completas, por eso aqui se usa una regex anclada al inicio. */
  async buscarPrefijo(q: string) {
    if (!q || q.trim() === '') {
      return [];
    }

    // Se escapan los caracteres especiales para que no rompan la regex
    const limpio = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return this.jugadorModel
      .aggregate([
        { $match: { nombre: { $regex: '^' + limpio, $options: 'i' } } },
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
          },
        },
        { $sort: { goles: -1, nombre: 1 } },
      ])
      .exec();
  }

  /* CRITERIO 8: busqueda con indice de texto
     El indice se declara en jugador.schema.ts */
  async buscar(q: string) {
    if (!q || q.trim() === '') {
      return [];
    }

    return this.jugadorModel
      .aggregate([
        // $text solo funciona porque existe el indice de texto.
        // A diferencia de $regex, no recorre documento por documento.
        { $match: { $text: { $search: q } } },

        // textScore indica que tan relevante es cada resultado
        { $addFields: { score: { $meta: 'textScore' } } },

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
            score: 1,
            equipoId: 1,
            equipo: '$club.nombre',
          },
        },
        { $sort: { score: -1 } },
      ])
      .exec();
  }

  async porEquipo(equipoId: string) {
    return this.jugadorModel
      .find({ equipoId: new Types.ObjectId(equipoId) })
      .sort({ goles: -1 })
      .exec();
  }
}