import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Equipo, EquipoSchema } from '../equipos/equipos.schema';
import { Jugador, JugadorSchema } from '../jugadores/jugador.schema';
import { Partido, PartidoSchema } from '../partidos/partido.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Equipo.name, schema: EquipoSchema },
      { name: Jugador.name, schema: JugadorSchema },
      /* se necesita para el cierre de temporada */
      { name: Partido.name, schema: PartidoSchema },
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}