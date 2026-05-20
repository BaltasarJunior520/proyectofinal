import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Envio } from '../../envios/entities/envio.entity';
import { EstadoEnvio } from '../../envios/entities/estado-envio.entity';

@Entity('seguimiento')
export class Seguimiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'envio_id' })
  envioId: number;

  @Column({ name: 'estado_id', nullable: true })
  estadoId: number;

  @Column({ type: 'text', nullable: true })
  ubicacion: string;

  @CreateDateColumn({ type: 'timestamp' })
  fecha: Date;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @ManyToOne(() => Envio, (envio) => envio.seguimientos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'envio_id' })
  envio: Envio;

  @ManyToOne(() => EstadoEnvio)
  @JoinColumn({ name: 'estado_id' })
  estado: EstadoEnvio;
}
