import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Equipo, EquipoSchema } from '../equipos/schemas/equipo.schema';
import { Jugador, JugadorSchema } from '../jugadores/schemas/jugador.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Equipo.name, schema: EquipoSchema },
      { name: Jugador.name, schema: JugadorSchema },
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
