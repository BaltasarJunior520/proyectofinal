import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Empleado } from '../../empleados/entities/empleado.entity';
import * as bcrypt from 'bcrypt';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre_usuario', length: 50, unique: true })
  nombreUsuario: string;

  @Column()
  password: string;

  @Column({ length: 50, nullable: true })
  rol: string;

  @Column({ default: true })
  estado: boolean;

  @Column({ name: 'empleado_id', nullable: true })
  empleadoId: number;

  @OneToOne(() => Empleado, (empleado) => empleado.usuario)
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
