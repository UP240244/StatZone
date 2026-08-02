import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { JugadoresController } from './jugadores.controller';
import { JugadoresService } from './jugadores.service';
import { Jugador, JugadorSchema } from './jugador.schema';
import { Equipo, EquipoSchema } from '../equipos/equipos.schema';
import { Partido, PartidoSchema } from '../partidos/partido.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Jugador.name, schema: JugadorSchema },
      { name: Equipo.name, schema: EquipoSchema },
      /* se necesita para validar los goles contra los partidos jugados */
      { name: Partido.name, schema: PartidoSchema },
    ]),
  ],
  controllers: [JugadoresController],
  providers: [JugadoresService],
})
export class JugadoresModule {}