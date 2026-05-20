import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactoClienteDto {
  @ApiProperty({ example: 'Emergencia', description: 'Tipo de contacto (Emergencia, Familiar, etc.)' })
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @ApiProperty({ example: 'Ana Perez', description: 'Nombre del contacto' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: '70000001', description: 'Teléfono del contacto' })
  @IsString()
  @IsNotEmpty()
  @Length(7, 20)
  telefono: string;
}
