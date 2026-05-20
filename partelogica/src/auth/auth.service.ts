import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(nombreUsuario: string, pass: string): Promise<any> {
    const usuario = await this.usuariosService.findByUsername(nombreUsuario);
    if (usuario && usuario.estado) {
      const isMatch = await bcrypt.compare(pass, usuario.password);
      if (isMatch) {
        const { password, ...result } = usuario;
        return result;
      }
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.nombreUsuario, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas o usuario inactivo.');
    }

    const payload = {
      username: user.nombreUsuario,
      sub: user.id,
      rol: user.rol,
      empleado_id: user.empleadoId || (user.empleado ? user.empleado.id : null),
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombreUsuario: user.nombreUsuario,
        rol: user.rol,
        empleadoId: payload.empleado_id,
      }
    };
  }
}
