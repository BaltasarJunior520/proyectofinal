import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SucursalesService } from './sucursales.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Sucursales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sucursales')
export class SucursalesController {
  constructor(private readonly sucursalesService: SucursalesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva sucursal' })
  @ApiResponse({ status: 201, description: 'Sucursal creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  create(@Body() createSucursalDto: CreateSucursalDto) {
    return this.sucursalesService.create(createSucursalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las sucursales' })
  @ApiResponse({ status: 200, description: 'Lista de sucursales devuelta exitosamente.' })
  findAll() {
    return this.sucursalesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una sucursal por su ID' })
  @ApiResponse({ status: 200, description: 'Sucursal devuelta exitosamente.' })
  @ApiResponse({ status: 404, description: 'Sucursal no encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sucursalesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una sucursal' })
  @ApiResponse({ status: 200, description: 'Sucursal actualizada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Sucursal no encontrada.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSucursalDto: UpdateSucursalDto) {
    return this.sucursalesService.update(id, updateSucursalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una sucursal' })
  @ApiResponse({ status: 200, description: 'Sucursal eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Sucursal no encontrada.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sucursalesService.remove(id);
  }
}
