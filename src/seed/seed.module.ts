import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { Equipo, EquipoSchema } from '../equipos/schemas/equipo.schema';
import { Jugador, JugadorSchema } from '../jugadores/schemas/jugador.schema';
import { Partido, PartidoSchema } from '../partidos/schemas/partido.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Equipo.name, schema: EquipoSchema },
      { name: Jugador.name, schema: JugadorSchema },
      { name: Partido.name, schema: PartidoSchema },
    ]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
