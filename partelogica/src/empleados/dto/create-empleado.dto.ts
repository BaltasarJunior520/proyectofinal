import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmpleadoDto {
  @ApiProperty({ example: 'Luis', description: 'Nombre del empleado' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Gomez', description: 'Apellido del empleado' })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({
    example: 'Cajero',
    description: 'Cargo o puesto del empleado',
  })
  @IsString()
  @IsNotEmpty()
  cargo: string;

  @ApiProperty({
    example: '77788888',
    description: 'Teléfono del empleado',
    required: false,
  })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiProperty({
    example: 1,
    description: 'ID de la sucursal asignada',
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  sucursalId?: number;
}
