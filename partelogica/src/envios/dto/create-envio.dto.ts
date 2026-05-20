import { IsInt, IsNotEmpty, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnvioDto {
  @ApiProperty({ example: 1, description: 'ID de la Encomienda' })
  @IsInt()
  @IsNotEmpty()
  encomiendaId: number;

  @ApiProperty({ example: 1, description: 'ID de la Sucursal Origen', required: false })
  @IsInt()
  @IsOptional()
  sucursalOrigenId?: number;

  @ApiProperty({ example: 2, description: 'ID de la Sucursal Destino', required: false })
  @IsInt()
  @IsOptional()
  sucursalDestinoId?: number;

  @ApiProperty({ example: '2026-05-20T12:00:00.000Z', description: 'Fecha de envío', required: false })
  @IsDateString()
  @IsOptional()
  fechaEnvio?: string;

  @ApiProperty({ example: '2026-05-22T12:00:00.000Z', description: 'Fecha estimada de entrega', required: false })
  @IsDateString()
  @IsOptional()
  fechaEstimada?: string;

  @ApiProperty({ example: 50.00, description: 'Costo del envío' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @Min(0)
  costo: number;

  @ApiProperty({ example: 1, description: 'ID del Estado del Envío (1: Registrado, 2: En tránsito, etc.)', required: false })
  @IsInt()
  @IsOptional()
  estadoId?: number;
}
