import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EnviosService } from './envios.service';
import { CreateEnvioDto } from './dto/create-envio.dto';
import { UpdateEnvioDto } from './dto/update-envio.dto';
import { CreateEntregaDto } from './dto/create-entrega.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Envios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('envios')
export class EnviosController {
  constructor(private readonly enviosService: EnviosService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar un nuevo envío físico para una encomienda',
  })
  @ApiResponse({
    status: 201,
    description:
      'Envío registrado exitosamente y primer seguimiento registrado automáticamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Encomienda ya enviada o datos inválidos.',
  })
  @ApiResponse({
    status: 404,
    description: 'Encomienda o sucursales no encontradas.',
  })
  create(@Body() createEnvioDto: CreateEnvioDto) {
    return this.enviosService.create(createEnvioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener la lista de todos los envíos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de envíos devuelta exitosamente.',
  })
  findAll() {
    return this.enviosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un envío por su ID' })
  @ApiResponse({ status: 200, description: 'Envío devuelto exitosamente.' })
  @ApiResponse({ status: 404, description: 'Envío no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.enviosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar la información básica de un envío' })
  @ApiResponse({ status: 200, description: 'Envío actualizado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Envío no encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEnvioDto: UpdateEnvioDto,
  ) {
    return this.enviosService.update(id, updateEnvioDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un envío del sistema' })
  @ApiResponse({ status: 200, description: 'Envío eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Envío no encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enviosService.remove(id);
  }

  @Post('entrega')
  @ApiOperation({
    summary:
      'Registrar la entrega física y final del envío con firma digital de conformidad',
  })
  @ApiResponse({
    status: 201,
    description:
      'Entrega registrada, envío actualizado a estado Entregado y registro de seguimiento final creado.',
  })
  @ApiResponse({
    status: 400,
    description: 'El envío ya fue entregado previamente.',
  })
  @ApiResponse({ status: 404, description: 'Envío no encontrado.' })
  registerEntrega(@Body() createEntregaDto: CreateEntregaDto) {
    return this.enviosService.registerEntrega(createEntregaDto);
  }
}
