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
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente creado exitosamente.' })
  @ApiResponse({
    status: 400,
    description: 'CI ya registrada o datos de entrada inválidos.',
  })
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los clientes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes devuelta exitosamente.',
  })
  findAll() {
    return this.clientesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cliente por su ID' })
  @ApiResponse({ status: 200, description: 'Cliente devuelto exitosamente.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un cliente' })
  @ApiResponse({
    status: 200,
    description: 'Cliente actualizado exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    return this.clientesService.update(id, updateClienteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un cliente' })
  @ApiResponse({ status: 200, description: 'Cliente eliminado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.remove(id);
  }

  @Post(':id/sucursales/:sucursalId')
  @ApiOperation({ summary: 'Asociar una sucursal al cliente' })
  @ApiResponse({
    status: 200,
    description: 'Asociación realizada exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente o Sucursal no encontrado.',
  })
  associateSucursal(
    @Param('id', ParseIntPipe) id: number,
    @Param('sucursalId', ParseIntPipe) sucursalId: number,
  ) {
    return this.clientesService.associateSucursal(id, sucursalId);
  }

  @Delete(':id/sucursales/:sucursalId')
  @ApiOperation({ summary: 'Desasociar una sucursal del cliente' })
  @ApiResponse({
    status: 200,
    description: 'Desasociación realizada exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente o Sucursal no encontrado.',
  })
  dissociateSucursal(
    @Param('id', ParseIntPipe) id: number,
    @Param('sucursalId', ParseIntPipe) sucursalId: number,
  ) {
    return this.clientesService.dissociateSucursal(id, sucursalId);
  }
}
