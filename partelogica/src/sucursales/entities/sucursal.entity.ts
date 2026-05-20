import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';

@Entity('sucursal')
export class Sucursal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text' })
  direccion: string;

  @Column({ length: 100, nullable: true })
  ciudad: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @ManyToMany(() => Cliente, (cliente) => cliente.sucursales)
  clientes: Cliente[];
}
