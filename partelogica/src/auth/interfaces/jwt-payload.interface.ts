export interface JwtPayload {
  username: string;
  sub: number;
  rol: string;
  empleado_id: number | null;
}

export interface AuthenticatedUser {
  id: number;
  nombreUsuario: string;
  rol: string;
  empleadoId: number | null;
}
