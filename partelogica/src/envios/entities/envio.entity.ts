import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Encomienda } from '../../encomiendas/entities/encomienda.entity';
import { Sucursal } from '../../sucursales/entities/sucursal.entity';
import { EstadoEnvio } from './estado-envio.entity';
import { Seguimiento } from '../../seguimientos/entities/seguimiento.entity';
import { Entrega } from './entrega.entity';

@Entity('envio')
export class Envio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'encomienda_id', unique: true })
  encomiendaId: number;

  @Column({ name: 'sucursal_origen_id', nullable: true })
  sucursalOrigenId: number;

  @Column({ name: 'sucursal_destino_id', nullable: true })
  sucursalDestinoId: number;

  @Column({ name: 'fecha_envio', type: 'timestamp', nullable: true })
  fechaEnvio?: Date | null;

  @Column({ name: 'fecha_estimada', type: 'timestamp', nullable: true })
  fechaEstimada?: Date | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costo: number;

  @Column({ name: 'estado_id', nullable: true })
  estadoId: number;

  @OneToOne(() => Encomienda)
  @JoinColumn({ name: 'encomienda_id' })
  encomienda: Encomienda;

  @ManyToOne(() => Sucursal)
  @JoinColumn({ name: 'sucursal_origen_id' })
  sucursalOrigen: Sucursal;

  @ManyToOne(() => Sucursal)
  @JoinColumn({ name: 'sucursal_destino_id' })
  sucursalDestino: Sucursal;

  @ManyToOne(() => EstadoEnvio)
  @JoinColumn({ name: 'estado_id' })
  estado: EstadoEnvio;

  @OneToMany(() => Seguimiento, (s) => s.envio)
  seguimientos: Seguimiento[];

  @OneToOne(() => Entrega, (e) => e.envio)
  entrega: Entrega;
}
