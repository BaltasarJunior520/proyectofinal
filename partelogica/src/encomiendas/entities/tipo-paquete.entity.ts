import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tipo_paquete')
export class TipoPaquete {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, nullable: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;
}
