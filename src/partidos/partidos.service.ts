import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Partido } from './schemas/partido.schema';
import { Equipo } from '../equipos/schemas/equipo.schema';
import { CreatePartidoDto } from './dto/create-partido.dto';

@Injectable()
export class PartidosService {
  constructor(
    @InjectModel(Partido.name) private partidoModel: Model<Partido>,
    @InjectModel(Equipo.name) private equipoModel: Model<Equipo>,
  ) {}

  async listar() {
    // populate trae el nombre de los dos equipos en lugar de solo el id
    return this.partidoModel
      .find()
      .populate('localId', 'nombre')
      .populate('visitanteId', 'nombre')
      .sort({ fecha: -1 })
      .exec();
  }

  async crear(dto: CreatePartidoDto) {
    if (dto.localId === dto.visitanteId) {
      throw new BadRequestException('Un equipo no puede jugar contra si mismo');
    }

    const local = await this.equipoModel.findById(dto.localId).exec();
    const visitante = await this.equipoModel.findById(dto.visitanteId).exec();

    if (!local || !visitante) {
      throw new BadRequestException('Alguno de los equipos no existe');
    }

    const nuevo = new this.partidoModel(dto);
    return nuevo.save();
  }

  async eliminar(id: string) {
    const borrado = await this.partidoModel.findByIdAndDelete(id).exec();
    if (!borrado) {
      throw new NotFoundException('Partido no encontrado');
    }
    return { ok: true, mensaje: 'Partido eliminado' };
  }
}
