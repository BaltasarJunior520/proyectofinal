import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: 'Nombre de usuario' })
  @IsString()
  @IsNotEmpty()
  nombreUsuario: string;

  @ApiProperty({ example: '123', description: 'Contraseña del usuario' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  password: string;
}
