import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'secretKey123',
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      nombreUsuario: payload.username,
      rol: payload.rol,
      empleadoId: payload.empleado_id,
    };
  }
}
