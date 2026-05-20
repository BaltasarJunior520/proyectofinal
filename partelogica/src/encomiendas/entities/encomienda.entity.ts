import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne, CreateDateColumn } from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { DetalleEncomienda } from './detalle-encomienda.entity';
import { Seguro } from './seguro.entity';

@Entity('encomienda')
export class Encomienda {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  codigo: string;

  @Column({ name: 'remitente_id' })
  remitenteId: number;

  @Column({ name: 'destinatario_id' })
  destinatarioId: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  peso: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  volumen: number;

  @Column({ name: 'valor_declarado', type: 'decimal', precision: 10, scale: 2, nullable: true })
  valorDeclarado: number;

  @CreateDateColumn({ name: 'fecha_registro', type: 'timestamp' })
  fechaRegistro: Date;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'remitente_id' })
  remitente: Cliente;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'destinatario_id' })
  destinatario: Cliente;

  @OneToMany(() => DetalleEncomienda, (detalle) => detalle.encomienda, { cascade: true })
  detalles: DetalleEncomienda[];

  @OneToOne(() => Seguro, (seguro) => seguro.encomienda, { cascade: true })
  seguro: Seguro;
}
