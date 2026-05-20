import { IsInt, IsNotEmpty, IsOptional, IsString, IsDateString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEntregaDto {
  @ApiProperty({ example: 1, description: 'ID del Envío' })
  @IsInt()
  @IsNotEmpty()
  envioId: number;

  @ApiProperty({ example: '2026-05-20T17:00:00.000Z', description: 'Fecha real de la entrega', required: false })
  @IsDateString()
  @IsOptional()
  fechaEntrega?: string;

  @ApiProperty({ example: 'Maria Lopez', description: 'Nombre de la persona que recibe el paquete' })
  @IsString()
  @IsNotEmpty()
  nombreRecibe: string;

  @ApiProperty({ example: '654321', description: 'Cédula de Identidad de quien recibe' })
  @IsString()
  @IsNotEmpty()
  @Length(5, 20)
  ciRecibe: string;

  @ApiProperty({ example: 'FirmaDigitalBase64StringOrText', description: 'Firma de conformidad' })
  @IsString()
  @IsNotEmpty()
  firma: string;
}
