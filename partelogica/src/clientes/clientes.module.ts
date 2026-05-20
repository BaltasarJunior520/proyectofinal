import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { Cliente } from './entities/cliente.entity';
import { ContactoCliente } from './entities/contacto-cliente.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, ContactoCliente, Sucursal])],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService],
})
export class ClientesModule {}
