import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Length, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'admin', description: 'Nombre de usuario único' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  nombreUsuario: string;

  @ApiProperty({ example: '123456', description: 'Contraseña del usuario' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  password: string;

  @ApiProperty({ example: 'admin', description: 'Rol asignado al usuario', required: false })
  @IsString()
  @IsOptional()
  rol?: string;

  @ApiProperty({ example: true, description: 'Estado activo o inactivo', required: false })
  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @ApiProperty({ example: 1, description: 'ID del empleado asociado', required: false })
  @IsInt()
  @IsOptional()
  @Min(1)
  empleadoId?: number;
}
