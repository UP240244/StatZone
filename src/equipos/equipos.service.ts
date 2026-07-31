import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Equipo } from './schemas/equipo.schema';
import { Jugador } from '../jugadores/schemas/jugador.schema';
import { Partido } from '../partidos/schemas/partido.schema';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';

@Injectable()
export class EquiposService {
  constructor(
    @InjectModel(Equipo.name) private equipoModel: Model<Equipo>,
    @InjectModel(Jugador.name) private jugadorModel: Model<Jugador>,
    @InjectModel(Partido.name) private partidoModel: Model<Partido>,
  ) {}

  async listar() {
    return this.equipoModel.find().sort({ nombre: 1 }).exec();
  }

  async uno(id: string) {
    const equipo = await this.equipoModel.findById(id).exec();
    if (!equipo) {
      throw new NotFoundException('Equipo no encontrado');
    }
    return equipo;
  }

  async crear(dto: CreateEquipoDto) {
    const nuevo = new this.equipoModel(dto);
    return nuevo.save();
  }

  async actualizar(id: string, dto: UpdateEquipoDto) {
    const actualizado = await this.equipoModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!actualizado) {
      throw new NotFoundException('Equipo no encontrado');
    }
    return actualizado;
  }

  async eliminar(id: string) {
    const borrado = await this.equipoModel.findByIdAndDelete(id).exec();

    if (!borrado) {
      throw new NotFoundException('Equipo no encontrado');
    }

    // Aqui el id llega como string, por eso hay que convertirlo a ObjectId
    const objectId = new Types.ObjectId(id);

    await this.jugadorModel.deleteMany({ equipoId: objectId }).exec();
    await this.partidoModel
      .deleteMany({ $or: [{ localId: objectId }, { visitanteId: objectId }] })
      .exec();

    return { ok: true, mensaje: 'Equipo eliminado con sus jugadores y partidos' };
  }
}
