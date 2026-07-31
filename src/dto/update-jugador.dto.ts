import {
  IsIn, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, Min,
} from 'class-validator';

export class UpdateJugadorDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  nombre?: string;

  @IsMongoId()
  @IsOptional()
  equipoId?: string;

  @IsIn(['POR', 'DEF', 'MED', 'DEL'])
  @IsOptional()
  pos?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  goles?: number;
}
