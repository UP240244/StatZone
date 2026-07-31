import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EquiposModule } from './equipos/equipos.module';
import { JugadoresModule } from './jugadores/jugadores.module';
import { PartidosModule } from './partidos/partidos.module';
import { StatsModule } from './stats/stats.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    // En Windows se usa 127.0.0.1 y no localhost para evitar el retraso de IPv6
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/statzone'),

    EquiposModule,
    JugadoresModule,
    PartidosModule,
    StatsModule,
    SeedModule,
  ],
})
export class AppModule {}