import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDetalleEncomiendaDto {
  @ApiProperty({ example: 1, description: 'ID del Tipo de Paquete' })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  tipoId: number;

  @ApiProperty({ example: 2, description: 'Cantidad de artículos' })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  cantidad: number;

  @ApiProperty({
    example: 'Cajas medianas',
    description: 'Observaciones del detalle',
    required: false,
  })
  @IsString()
  @IsOptional()
  observaciones?: string;
}
