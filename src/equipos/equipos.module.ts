import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EquiposController } from './equipos.controller';
import { EquiposService } from './equipos.service';
import { Equipo, EquipoSchema } from './equipos.schema';
import { Jugador, JugadorSchema } from '../jugadores/jugador.schema';
import { Partido, PartidoSchema } from '../partidos/partido.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Equipo.name, schema: EquipoSchema },
      // Se registran tambien estos dos para el borrado en cascada
      { name: Jugador.name, schema: JugadorSchema },
      { name: Partido.name, schema: PartidoSchema },
    ]),
  ],
  controllers: [EquiposController],
  providers: [EquiposService],
})
export class EquiposModule {}
