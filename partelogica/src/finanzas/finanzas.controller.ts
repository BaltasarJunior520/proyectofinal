import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FinanzasService } from './finanzas.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Finanzas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('finanzas')
export class FinanzasController {
  constructor(private readonly finanzasService: FinanzasService) {}

  @Post('pagos')
  @ApiOperation({
    summary:
      'Registrar un pago y opcionalmente generar una factura comercial de forma uno a uno',
  })
  @ApiResponse({
    status: 201,
    description: 'Pago registrado y factura creada exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Envío no encontrado.' })
  createPago(@Body() createPagoDto: CreatePagoDto) {
    return this.finanzasService.createPago(createPagoDto);
  }

  @Get('pagos')
  @ApiOperation({ summary: 'Obtener la lista de todos los pagos registrados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pagos devuelta exitosamente.',
  })
  findAllPagos() {
    return this.finanzasService.findAllPagos();
  }

  @Get('pagos/:id')
  @ApiOperation({ summary: 'Obtener un pago específico por su ID' })
  @ApiResponse({ status: 200, description: 'Pago devuelto exitosamente.' })
  @ApiResponse({ status: 404, description: 'Pago no encontrado.' })
  findPagoOne(@Param('id', ParseIntPipe) id: number) {
    return this.finanzasService.findPagoOne(id);
  }

  @Get('facturas')
  @ApiOperation({
    summary: 'Obtener la lista de todas las facturas comerciales emitidas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de facturas devuelta exitosamente.',
  })
  findAllFacturas() {
    return this.finanzasService.findAllFacturas();
  }

  @Get('facturas/:id')
  @ApiOperation({
    summary: 'Obtener una factura comercial específica por su ID',
  })
  @ApiResponse({ status: 200, description: 'Factura devuelta exitosamente.' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada.' })
  findFacturaOne(@Param('id', ParseIntPipe) id: number) {
    return this.finanzasService.findFacturaOne(id);
  }
}
