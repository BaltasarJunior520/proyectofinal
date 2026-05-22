import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncomiendasService } from './encomiendas.service';
import { EncomiendasController } from './encomiendas.controller';
import { Encomienda } from './entities/encomienda.entity';
import { DetalleEncomienda } from './entities/detalle-encomienda.entity';
import { Seguro } from './entities/seguro.entity';
import { TipoPaquete } from './entities/tipo-paquete.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Encomienda,
      DetalleEncomienda,
      Seguro,
      TipoPaquete,
    ]),
  ],
  controllers: [EncomiendasController],
  providers: [EncomiendasService],
  exports: [EncomiendasService, TypeOrmModule],
})
export class EncomiendasModule {}
