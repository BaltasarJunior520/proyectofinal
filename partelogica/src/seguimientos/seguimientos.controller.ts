import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SeguimientosService } from './seguimientos.service';
import { CreateSeguimientoDto } from './dto/create-seguimiento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Seguimiento')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('seguimientos')
export class SeguimientosController {
  constructor(private readonly seguimientosService: SeguimientosService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo evento de seguimiento y actualizar el estado general del envío de forma integrada' })
  @ApiResponse({ status: 201, description: 'Seguimiento registrado y envío actualizado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Envío o estado no encontrados.' })
  create(@Body() createSeguimientoDto: CreateSeguimientoDto) {
    return this.seguimientosService.create(createSeguimientoDto);
  }

  @Get('envio/:envioId')
  @ApiOperation({ summary: 'Obtener el historial completo de seguimiento de un envío ordenado por fecha de forma descendente' })
  @ApiResponse({ status: 200, description: 'Historial de seguimiento devuelto exitosamente.' })
  @ApiResponse({ status: 404, description: 'Envío no encontrado.' })
  findByEnvioId(@Param('envioId', ParseIntPipe) envioId: number) {
    return this.seguimientosService.findByEnvioId(envioId);
  }
}
