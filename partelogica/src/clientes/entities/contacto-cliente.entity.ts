import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cliente } from './cliente.entity';

@Entity('contacto_cliente')
export class ContactoCliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cliente_id' })
  clienteId: number;

  @Column({ length: 50, nullable: true })
  tipo: string;

  @Column({ length: 100, nullable: true })
  nombre: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.contactos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;
}
