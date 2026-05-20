import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Encomienda } from './encomienda.entity';
import { TipoPaquete } from './tipo-paquete.entity';

@Entity('detalle_encomienda')
export class DetalleEncomienda {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'encomienda_id' })
  encomiendaId: number;

  @Column({ name: 'tipo_id' })
  tipoId: number;

  @Column({ type: 'int', nullable: true })
  cantidad: number;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @ManyToOne(() => Encomienda, (encomienda) => encomienda.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'encomienda_id' })
  encomienda: Encomienda;

  @ManyToOne(() => TipoPaquete)
  @JoinColumn({ name: 'tipo_id' })
  tipoPaquete: TipoPaquete;
}
