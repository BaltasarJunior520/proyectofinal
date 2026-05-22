import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSeguroDto {
  @ApiProperty({ example: 20.0, description: 'Monto asegurado' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @Min(0)
  monto: number;

  @ApiProperty({
    example: 'Seguro básico contra daños',
    description: 'Descripción de la cobertura de seguro',
    required: false,
  })
  @IsString()
  @IsOptional()
  descripcion?: string;
}
