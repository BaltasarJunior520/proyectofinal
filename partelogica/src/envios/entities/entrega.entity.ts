import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Envio } from './envio.entity';

@Entity('entrega')
export class Entrega {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'envio_id', unique: true })
  envioId: number;

  @Column({ name: 'fecha_entrega', type: 'timestamp', nullable: true })
  fechaEntrega: Date;

  @Column({ name: 'nombre_recibe', length: 100, nullable: true })
  nombreRecibe: string;

  @Column({ name: 'ci_recibe', length: 20, nullable: true })
  ciRecibe: string;

  @Column({ type: 'text', nullable: true })
  firma: string;

  @OneToOne(() => Envio, (envio) => envio.entrega, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'envio_id' })
  envio: Envio;
}
