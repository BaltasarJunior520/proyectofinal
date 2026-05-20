import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFacturaDto {
  @ApiProperty({ example: 'F001', description: 'Número identificador de la factura' })
  @IsString()
  @IsNotEmpty()
  numeroFactura: string;

  @ApiProperty({ example: '1234567', description: 'Número de Identificación Tributaria (NIT)', required: false })
  @IsString()
  @IsOptional()
  nit?: string;

  @ApiProperty({ example: 'Juan Perez', description: 'Razón Social de la factura', required: false })
  @IsString()
  @IsOptional()
  razonSocial?: string;
}
