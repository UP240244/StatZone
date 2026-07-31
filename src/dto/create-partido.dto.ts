import {
  IsDateString, IsInt, IsMongoId, IsOptional, Min,
} from 'class-validator';

export class CreatePartidoDto {
  @IsMongoId({ message: 'El equipo local no es valido' })
  localId!: string;

  @IsMongoId({ message: 'El equipo visitante no es valido' })
  visitanteId!: string;

  @IsInt()
  @Min(0, { message: 'Los goles no pueden ser negativos' })
  golesLocal!: number;

  @IsInt()
  @Min(0, { message: 'Los goles no pueden ser negativos' })
  golesVisitante!: number;

  @IsDateString()
  @IsOptional()
  fecha?: string;
}
