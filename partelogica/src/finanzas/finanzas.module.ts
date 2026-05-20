import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanzasService } from './finanzas.service';
import { FinanzasController } from './finanzas.controller';
import { Pago } from './entities/pago.entity';
import { Factura } from './entities/factura.entity';
import { Envio } from '../envios/entities/envio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Factura, Envio])],
  controllers: [FinanzasController],
  providers: [FinanzasService],
  exports: [FinanzasService],
})
export class FinanzasModule {}
