import { Controller, Get, Post } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('tabla')
  tabla() {
    return this.statsService.tabla();
  }

  @Get('goleo')
  goleo() {
    return this.statsService.goleo();
  }

  /* cierra la temporada: devuelve al campeon y reinicia la competencia */
  @Post('temporada/fin')
  finTemporada() {
    return this.statsService.finTemporada();
  }
}