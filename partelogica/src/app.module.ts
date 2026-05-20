import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { EncomiendasModule } from './encomiendas/encomiendas.module';
import { EnviosModule } from './envios/envios.module';
import { SeguimientosModule } from './seguimientos/seguimientos.module';
import { FinanzasModule } from './finanzas/finanzas.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USERNAME ?? 'postgres',
        password: process.env.DB_PASSWORD ?? '123qwe',
        database: process.env.DB_DATABASE ?? 'sgebd',
        autoLoadEntities: true,
        synchronize: false, // Tablas gestionadas mediante tablas.sql
      }),
    }),
    UsuariosModule,
    EmpleadosModule,
    AuthModule,
    ClientesModule,
    SucursalesModule,
    EncomiendasModule,
    EnviosModule,
    SeguimientosModule,
    FinanzasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
