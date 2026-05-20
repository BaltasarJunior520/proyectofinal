import { IsString, IsNotEmpty, IsInt, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateDetalleEncomiendaDto } from './create-detalle-encomienda.dto';
import { CreateSeguroDto } from './create-seguro.dto';

export class CreateEncomiendaDto {
  @ApiProperty({ example: 'ENC999', description: 'Código único identificador de la encomienda' })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({ example: 1, description: 'ID del Cliente Remitente' })
  @IsInt()
  @IsNotEmpty()
  remitenteId: number;

  @ApiProperty({ example: 2, description: 'ID del Cliente Destinatario' })
  @IsInt()
  @IsNotEmpty()
  destinatarioId: number;

  @ApiProperty({ example: 'Caja con ropa de invierno', description: 'Descripción física de los contenidos', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: 5.50, description: 'Peso en kilogramos', required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  peso?: number;

  @ApiProperty({ example: 0.30, description: 'Volumen estimado en metros cúbicos', required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  volumen?: number;

  @ApiProperty({ example: 200.00, description: 'Valor monetario declarado', required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  valorDeclarado?: number;

  @ApiProperty({ type: [CreateDetalleEncomiendaDto], description: 'Detalles específicos de los paquetes de la encomienda' })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleEncomiendaDto)
  detalles: CreateDetalleEncomiendaDto[];

  @ApiProperty({ type: CreateSeguroDto, description: 'Seguro opcional de la encomienda', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateSeguroDto)
  seguro?: CreateSeguroDto;
}
