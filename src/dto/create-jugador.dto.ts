import {
  IsIn, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, Min,
} from 'class-validator';

export class CreateJugadorDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del jugador es obligatorio' })
  nombre!: string;

  @IsMongoId({ message: 'El equipo no es valido' })
  equipoId!: string;

  @IsIn(['POR', 'DEF', 'MED', 'DEL'], { message: 'Posicion invalida' })
  @IsOptional()
  pos?: string;

  @IsInt()
  @Min(0, { message: 'Los goles no pueden ser negativos' })
  @IsOptional()
  goles?: number;
}
