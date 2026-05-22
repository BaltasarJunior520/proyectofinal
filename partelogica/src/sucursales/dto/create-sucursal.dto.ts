import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSucursalDto {
  @ApiProperty({
    example: 'Sucursal Central',
    description: 'Nombre de la sucursal',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    example: 'Av. Siempre Viva',
    description: 'Dirección física de la sucursal',
  })
  @IsString()
  @IsNotEmpty()
  direccion: string;

  @ApiProperty({
    example: 'La Paz',
    description: 'Ciudad donde se encuentra',
    required: false,
  })
  @IsString()
  @IsOptional()
  ciudad?: string;

  @ApiProperty({
    example: '2221111',
    description: 'Teléfono de contacto',
    required: false,
  })
  @IsString()
  @IsOptional()
  telefono?: string;
}
