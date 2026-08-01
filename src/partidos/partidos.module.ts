import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PartidosController } from './partidos.controller';
import { PartidosService } from './partidos.service';
import { Partido, PartidoSchema } from './partido.schema';
import { Equipo, EquipoSchema } from '../equipos/equipos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Partido.name, schema: PartidoSchema },
      { name: Equipo.name, schema: EquipoSchema },
    ]),
  ],
  controllers: [PartidosController],
  providers: [PartidosService],
})
export class PartidosModule {}
