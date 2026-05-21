import { IsInt, IsNotEmpty, IsNumber, IsString, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateFacturaDto } from './create-factura.dto';

export class CreatePagoDto {
  @ApiProperty({ example: 1, description: 'ID del Envío' })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  envioId: number;

  @ApiProperty({ example: 50.00, description: 'Monto pagado' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @Min(0)
  monto: number;

  @ApiProperty({ example: 'Efectivo', description: 'Método de pago (Efectivo, QR, Tarjeta, etc.)' })
  @IsString()
  @IsNotEmpty()
  metodo: string;

  @ApiProperty({ type: CreateFacturaDto, description: 'Factura comercial asociada opcional', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateFacturaDto)
  factura?: CreateFacturaDto;
}
