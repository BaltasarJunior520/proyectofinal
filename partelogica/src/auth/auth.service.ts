import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import {
  JwtPayload,
  AuthenticatedUser,
} from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  private async validateUser(
    nombreUsuario: string,
    pass: string,
  ): Promise<AuthenticatedUser | null> {
    const usuario = await this.usuariosService.findByUsername(nombreUsuario);
    if (!usuario || !usuario.estado) {
      return null;
    }

    const isMatch = await bcrypt.compare(pass, usuario.password);
    if (!isMatch) {
      return null;
    }

    return this.toAuthenticatedUser(usuario);
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(
      loginDto.nombreUsuario,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException(
        'Credenciales incorrectas o usuario inactivo.',
      );
    }

    const payload: JwtPayload = {
      username: user.nombreUsuario,
      sub: user.id,
      rol: user.rol,
      empleado_id: user.empleadoId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  private toAuthenticatedUser(usuario: Usuario): AuthenticatedUser {
    return {
      id: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      rol: usuario.rol,
      empleadoId:
        usuario.empleadoId ?? (usuario.empleado ? usuario.empleado.id : null),
    };
  }
}
