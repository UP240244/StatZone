import {
  Body, Controller, Delete, Get, Param, Post, Put, Query,
} from '@nestjs/common';

import { JugadoresService } from './jugadores.service';
import { CreateJugadorDto } from './dto/create-jugador.dto';
import { UpdateJugadorDto } from './dto/update-jugador.dto';

@Controller('jugadores')
export class JugadoresController {
  constructor(private readonly jugadoresService: JugadoresService) {}

  @Get()
  listar() {
    return this.jugadoresService.listar();
  }

  /* IMPORTANTE: las rutas fijas van ANTES que ':id'.
     Si se declara despues, Nest interpreta "buscar" como si fuera un id. */
  @Get('buscar')
  buscar(@Query('q') q: string) {
    // El valor viaja en la query string (?q=...), por eso es @Query y no @Param
    return this.jugadoresService.buscar(q);
  }

  @Get('equipo/:equipoId')
  porEquipo(@Param('equipoId') equipoId: string) {
    return this.jugadoresService.porEquipo(equipoId);
  }

  @Get(':id')
  uno(@Param('id') id: string) {
    return this.jugadoresService.uno(id);
  }

  @Post()
  crear(@Body() dto: CreateJugadorDto) {
    return this.jugadoresService.crear(dto);
  }

  @Put(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateJugadorDto) {
    return this.jugadoresService.actualizar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.jugadoresService.eliminar(id);
  }
}
