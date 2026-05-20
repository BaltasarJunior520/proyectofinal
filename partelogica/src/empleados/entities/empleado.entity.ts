import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('empleado')
export class Empleado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true })
  nombre: string;

  @Column({ length: 100, nullable: true })
  apellido: string;

  @Column({ length: 100, nullable: true })
  cargo: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ name: 'sucursal_id', nullable: true })
  sucursalId: number;

  @OneToOne(() => Usuario, (usuario) => usuario.empleado)
  usuario: Usuario;
}
