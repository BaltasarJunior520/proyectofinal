import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeguimientosService } from './seguimientos.service';
import { SeguimientosController } from './seguimientos.controller';
import { Seguimiento } from './entities/seguimiento.entity';
import { Envio } from '../envios/entities/envio.entity';
import { EstadoEnvio } from '../envios/entities/estado-envio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Seguimiento, Envio, EstadoEnvio])],
  controllers: [SeguimientosController],
  providers: [SeguimientosService],
  exports: [SeguimientosService],
})
export class SeguimientosModule {}
