import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateEquipoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede quedar vacio' })
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  ciudad?: string;
}
