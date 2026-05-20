import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, CreateDateColumn } from 'typeorm';
import { ContactoCliente } from './contacto-cliente.entity';
import { Sucursal } from '../../sucursales/entities/sucursal.entity';

@Entity('cliente')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Column({ length: 20, unique: true, nullable: true })
  ci: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @CreateDateColumn({ name: 'fecha_registro', type: 'timestamp' })
  fechaRegistro: Date;

  @OneToMany(() => ContactoCliente, (contacto) => contacto.cliente, { cascade: true })
  contactos: ContactoCliente[];

  @ManyToMany(() => Sucursal, (sucursal) => sucursal.clientes)
  @JoinTable({
    name: 'cliente_sucursal',
    joinColumn: { name: 'cliente_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'sucursal_id', referencedColumnName: 'id' },
  })
  sucursales: Sucursal[];
}
