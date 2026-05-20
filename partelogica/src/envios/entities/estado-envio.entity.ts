import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('estado_envio')
export class EstadoEnvio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, nullable: true })
  nombre: string;
}
