import { Controller, Get } from '@nestjs/common';
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
}
