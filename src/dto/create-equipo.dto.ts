import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEquipoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del equipo es obligatorio' })
  nombre!: string;

  @IsString()
  @IsOptional()
  ciudad?: string;
}
