import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
} from 'typeorm';
import { Envio } from '../../envios/entities/envio.entity';
import { Factura } from './factura.entity';

@Entity('pago')
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'envio_id' })
  envioId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monto: number;

  @Column({ length: 50, nullable: true })
  metodo: string;

  @CreateDateColumn({ type: 'timestamp' })
  fecha: Date;

  @ManyToOne(() => Envio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'envio_id' })
  envio: Envio;

  @OneToOne(() => Factura, (factura) => factura.pago)
  factura: Factura;
}
