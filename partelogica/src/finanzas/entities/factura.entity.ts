import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Pago } from './pago.entity';

@Entity('factura')
export class Factura {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'pago_id', unique: true })
  pagoId: number;

  @Column({ name: 'numero_factura', length: 50, nullable: true })
  numeroFactura: string;

  @Column({ length: 20, nullable: true })
  nit: string;

  @Column({ name: 'razon_social', length: 150, nullable: true })
  razonSocial: string;

  @CreateDateColumn({ type: 'timestamp' })
  fecha: Date;

  @OneToOne(() => Pago, (pago) => pago.factura, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pago_id' })
  pago: Pago;
}
