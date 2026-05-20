import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSeguimientoDto {
  @ApiProperty({ example: 1, description: 'ID del Envío' })
  @IsInt()
  @IsNotEmpty()
  envioId: number;

  @ApiProperty({ example: 2, description: 'ID del Nuevo Estado (1: Registrado, 2: En tránsito, 3: Entregado)' })
  @IsInt()
  @IsNotEmpty()
  estadoId: number;

  @ApiProperty({ example: 'Sucursal Cochabamba', description: 'Ubicación física actual del paquete' })
  @IsString()
  @IsNotEmpty()
  ubicacion: string;

  @ApiProperty({ example: 'Llegada del paquete a la sucursal de destino', description: 'Observaciones del seguimiento', required: false })
  @IsString()
  @IsOptional()
  observaciones?: string;
}
