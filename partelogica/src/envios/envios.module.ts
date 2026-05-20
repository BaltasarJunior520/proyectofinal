import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnviosService } from './envios.service';
import { EnviosController } from './envios.controller';
import { Envio } from './entities/envio.entity';
import { EstadoEnvio } from './entities/estado-envio.entity';
import { Entrega } from './entities/entrega.entity';
import { Encomienda } from '../encomiendas/entities/encomienda.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Seguimiento } from '../seguimientos/entities/seguimiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Envio, EstadoEnvio, Entrega, Encomienda, Sucursal, Seguimiento])],
  controllers: [EnviosController],
  providers: [EnviosService],
  exports: [EnviosService, TypeOrmModule],
})
export class EnviosModule {}
