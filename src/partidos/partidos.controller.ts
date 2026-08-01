import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { PartidosService } from './partidos.service';
import { CreatePartidoDto } from '../dto/create-partido.dto';

@Controller('partidos')
export class PartidosController {
  constructor(private readonly partidosService: PartidosService) {}

  @Get()
  listar() {
    return this.partidosService.listar();
  }

  @Post()
  crear(@Body() dto: CreatePartidoDto) {
    return this.partidosService.crear(dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.partidosService.eliminar(id);
  }
}