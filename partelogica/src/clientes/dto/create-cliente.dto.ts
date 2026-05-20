import { IsString, IsNotEmpty, IsOptional, IsEmail, IsArray, ValidateNested, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateContactoClienteDto } from './create-contacto-cliente.dto';

export class CreateClienteDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre del cliente' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Perez', description: 'Apellido del cliente' })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({ example: '123456', description: 'Cédula de Identidad (único)' })
  @IsString()
  @IsNotEmpty()
  ci: string;

  @ApiProperty({ example: '77711111', description: 'Teléfono del cliente', required: false })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiProperty({ example: 'juan@gmail.com', description: 'Email del cliente', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'La Paz', description: 'Dirección del cliente', required: false })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiProperty({ type: [CreateContactoClienteDto], description: 'Contactos asociados al cliente', required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateContactoClienteDto)
  contactos?: CreateContactoClienteDto[];
}
