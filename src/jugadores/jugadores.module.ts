import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { JugadoresController } from './jugadores.controller';
import { JugadoresService } from './jugadores.service';
import { Jugador, JugadorSchema } from './jugador.schema';
import { Equipo, EquipoSchema } from '../equipos/equipos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Jugador.name, schema: JugadorSchema },
      { name: Equipo.name, schema: EquipoSchema },
    ]),
  ],
  controllers: [JugadoresController],
  providers: [JugadoresService],
})
export class JugadoresModule {}