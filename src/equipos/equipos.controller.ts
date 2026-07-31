import {
  Body, Controller, Delete, Get, Param, Post, Put,
} from '@nestjs/common';

import { EquiposService } from './equipos.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';

@Controller('equipos') // queda en /api/equipos por el prefijo global
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

  @Get()
  listar() {
    return this.equiposService.listar();
  }

  @Get(':id')
  uno(@Param('id') id: string) {
    return this.equiposService.uno(id);
  }

  @Post()
  crear(@Body() dto: CreateEquipoDto) {
    return this.equiposService.crear(dto);
  }

  @Put(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateEquipoDto) {
    return this.equiposService.actualizar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.equiposService.eliminar(id);
  }
}
