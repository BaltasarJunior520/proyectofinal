import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Encomienda } from './encomienda.entity';

@Entity('seguro')
export class Seguro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'encomienda_id', unique: true })
  encomiendaId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monto: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @OneToOne(() => Encomienda, (encomienda) => encomienda.seguro, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'encomienda_id' })
  encomienda: Encomienda;
}
