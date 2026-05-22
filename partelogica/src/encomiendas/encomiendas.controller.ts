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
import { EncomiendasService } from './encomiendas.service';
import { CreateEncomiendaDto } from './dto/create-encomienda.dto';
import { UpdateEncomiendaDto } from './dto/update-encomienda.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Encomiendas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('encomiendas')
export class EncomiendasController {
  constructor(private readonly encomiendasService: EncomiendasService) {}

  @Post()
  @ApiOperation({
    summary:
      'Crear una nueva encomienda con sus detalles y seguro de forma transaccional y atómica',
  })
  @ApiResponse({
    status: 201,
    description:
      'Encomienda, detalles y seguro creados exitosamente en una única transacción.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Código duplicado, falta de detalles u otros errores de validación.',
  })
  @ApiResponse({
    status: 404,
    description: 'Clientes o tipo de paquete no encontrados.',
  })
  create(@Body() createEncomiendaDto: CreateEncomiendaDto) {
    return this.encomiendasService.create(createEncomiendaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las encomiendas registradas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de encomiendas devuelta exitosamente.',
  })
  findAll() {
    return this.encomiendasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una encomienda por su ID' })
  @ApiResponse({
    status: 200,
    description: 'Encomienda devuelta exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Encomienda no encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.encomiendasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar los datos básicos o seguro de una encomienda',
  })
  @ApiResponse({
    status: 200,
    description: 'Encomienda actualizada exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Encomienda no encontrada.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEncomiendaDto: UpdateEncomiendaDto,
  ) {
    return this.encomiendasService.update(id, updateEncomiendaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una encomienda de la base de datos' })
  @ApiResponse({
    status: 200,
    description: 'Encomienda eliminada exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Encomienda no encontrada.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.encomiendasService.remove(id);
  }
}
