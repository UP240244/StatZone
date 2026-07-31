import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Jugador } from './schemas/jugador.schema';
import { Equipo } from '../equipos/schemas/equipo.schema';
import { CreateJugadorDto } from './dto/create-jugador.dto';
import { UpdateJugadorDto } from './dto/update-jugador.dto';

@Injectable()
export class JugadoresService {
  constructor(
    @InjectModel(Jugador.name) private jugadorModel: Model<Jugador>,
    @InjectModel(Equipo.name) private equipoModel: Model<Equipo>,
  ) {}

  async listar() {
    return this.jugadorModel.find().sort({ goles: -1 }).exec();
  }

  async uno(id: string) {
    const jugador = await this.jugadorModel.findById(id).exec();
    if (!jugador) {
      throw new NotFoundException('Jugador no encontrado');
    }
    return jugador;
  }

  async crear(dto: CreateJugadorDto) {
    // Verificar que el equipo exista antes de guardar al jugador
    const equipo = await this.equipoModel.findById(dto.equipoId).exec();
    if (!equipo) {
      throw new BadRequestException('El equipo indicado no existe');
    }

    const nuevo = new this.jugadorModel(dto);
    return nuevo.save();
  }

  async actualizar(id: string, dto: UpdateJugadorDto) {
    if (dto.equipoId) {
      const equipo = await this.equipoModel.findById(dto.equipoId).exec();
      if (!equipo) {
        throw new BadRequestException('El equipo indicado no existe');
      }
    }

    const actualizado = await this.jugadorModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!actualizado) {
      throw new NotFoundException('Jugador no encontrado');
    }
    return actualizado;
  }

  async eliminar(id: string) {
    const borrado = await this.jugadorModel.findByIdAndDelete(id).exec();
    if (!borrado) {
      throw new NotFoundException('Jugador no encontrado');
    }
    return { ok: true, mensaje: 'Jugador eliminado' };
  }

  /* ============================================================
     CRITERIO 8: busqueda con indice de texto
     El indice se declara en jugador.schema.ts
     ============================================================ */
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

        // Se relaciona con equipos para mostrar el nombre del club
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
