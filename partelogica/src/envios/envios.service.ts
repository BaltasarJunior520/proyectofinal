import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Envio } from './entities/envio.entity';
import { EstadoEnvio } from './entities/estado-envio.entity';
import { Entrega } from './entities/entrega.entity';
import { CreateEnvioDto } from './dto/create-envio.dto';
import { UpdateEnvioDto } from './dto/update-envio.dto';
import { CreateEntregaDto } from './dto/create-entrega.dto';
import { Encomienda } from '../encomiendas/entities/encomienda.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Seguimiento } from '../seguimientos/entities/seguimiento.entity';

@Injectable()
export class EnviosService {
  constructor(
    @InjectRepository(Envio)
    private readonly enviosRepository: Repository<Envio>,
    @InjectRepository(EstadoEnvio)
    private readonly estadosRepository: Repository<EstadoEnvio>,
    @InjectRepository(Entrega)
    private readonly entregasRepository: Repository<Entrega>,
    @InjectRepository(Encomienda)
    private readonly encomiendasRepository: Repository<Encomienda>,
    @InjectRepository(Sucursal)
    private readonly sucursalesRepository: Repository<Sucursal>,
    @InjectRepository(Seguimiento)
    private readonly seguimientosRepository: Repository<Seguimiento>,
  ) {}

  async create(createEnvioDto: CreateEnvioDto): Promise<Envio> {
    // 1. Validar Encomienda
    const encomienda = await this.encomiendasRepository.findOne({ where: { id: createEnvioDto.encomiendaId } });
    if (!encomienda) {
      throw new NotFoundException(`La encomienda con ID ${createEnvioDto.encomiendaId} no existe.`);
    }

    // 2. Validar que no tenga ya un envío
    const existingEnvio = await this.enviosRepository.findOne({ where: { encomiendaId: createEnvioDto.encomiendaId } });
    if (existingEnvio) {
      throw new BadRequestException(`La encomienda con ID ${createEnvioDto.encomiendaId} ya tiene un envío registrado (Envío ID ${existingEnvio.id}).`);
    }

    // 3. Validar Sucursales
    if (createEnvioDto.sucursalOrigenId) {
      const origen = await this.sucursalesRepository.findOne({ where: { id: createEnvioDto.sucursalOrigenId } });
      if (!origen) {
        throw new NotFoundException(`La sucursal de origen con ID ${createEnvioDto.sucursalOrigenId} no existe.`);
      }
    }
    if (createEnvioDto.sucursalDestinoId) {
      const destino = await this.sucursalesRepository.findOne({ where: { id: createEnvioDto.sucursalDestinoId } });
      if (!destino) {
        throw new NotFoundException(`La sucursal de destino con ID ${createEnvioDto.sucursalDestinoId} no existe.`);
      }
    }

    // 4. Validar Estado
    const estadoId = createEnvioDto.estadoId ?? 1; // 1: Registrado
    const estado = await this.estadosRepository.findOne({ where: { id: estadoId } });
    if (!estado) {
      throw new NotFoundException(`El estado de envío con ID ${estadoId} no existe.`);
    }

    // 5. Crear Envío
    const envio = this.enviosRepository.create({
      ...createEnvioDto,
      estadoId,
      fechaEnvio: createEnvioDto.fechaEnvio ? new Date(createEnvioDto.fechaEnvio) : new Date(),
      fechaEstimada: createEnvioDto.fechaEstimada ? new Date(createEnvioDto.fechaEstimada) : null,
    });
    const savedEnvio = await this.enviosRepository.save(envio);

    // 6. Crear primer Seguimiento de forma automática
    let ubicacionInicial = 'Origen';
    if (createEnvioDto.sucursalOrigenId) {
      const origenSucursal = await this.sucursalesRepository.findOne({ where: { id: createEnvioDto.sucursalOrigenId } });
      if (origenSucursal) {
        ubicacionInicial = origenSucursal.nombre;
      }
    }
    const seguimientoInicial = this.seguimientosRepository.create({
      envioId: savedEnvio.id,
      estadoId,
      ubicacion: ubicacionInicial,
      observaciones: 'Envío registrado en el sistema.',
    });
    await this.seguimientosRepository.save(seguimientoInicial);

    return this.findOne(savedEnvio.id);
  }

  async findAll(): Promise<Envio[]> {
    return this.enviosRepository.find({
      relations: {
        encomienda: { remitente: true, destinatario: true },
        sucursalOrigen: true,
        sucursalDestino: true,
        estado: true,
        seguimientos: true,
        entrega: true,
      },
    });
  }

  async findOne(id: number): Promise<Envio> {
    const envio = await this.enviosRepository.findOne({
      where: { id },
      relations: {
        encomienda: { remitente: true, destinatario: true },
        sucursalOrigen: true,
        sucursalDestino: true,
        estado: true,
        seguimientos: true,
        entrega: true,
      },
    });
    if (!envio) {
      throw new NotFoundException(`Envío con ID ${id} no encontrado.`);
    }
    return envio;
  }

  async update(id: number, updateEnvioDto: UpdateEnvioDto): Promise<Envio> {
    const envio = await this.findOne(id);

    if (updateEnvioDto.estadoId) {
      const estado = await this.estadosRepository.findOne({ where: { id: updateEnvioDto.estadoId } });
      if (!estado) {
        throw new NotFoundException(`Estado de envío con ID ${updateEnvioDto.estadoId} no existe.`);
      }
    }

    this.enviosRepository.merge(envio, updateEnvioDto);
    await this.enviosRepository.save(envio);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const envio = await this.findOne(id);
    await this.enviosRepository.remove(envio);
  }

  async registerEntrega(createEntregaDto: CreateEntregaDto): Promise<Envio> {
    const envio = await this.findOne(createEntregaDto.envioId);
    if (envio.entrega) {
      throw new BadRequestException(`El envío con ID ${createEntregaDto.envioId} ya ha sido entregado.`);
    }

    // 1. Crear registro de Entrega
    const entrega = this.entregasRepository.create({
      ...createEntregaDto,
      fechaEntrega: createEntregaDto.fechaEntrega ? new Date(createEntregaDto.fechaEntrega) : new Date(),
    });
    await this.entregasRepository.save(entrega);

    // 2. Cambiar estado del envío a 3 (Entregado)
    envio.estadoId = 3; // 3: Entregado
    await this.enviosRepository.save(envio);

    // 3. Crear registro de Seguimiento final
    const seguimiento = this.seguimientosRepository.create({
      envioId: envio.id,
      estadoId: 3,
      ubicacion: 'Destino Final',
      observaciones: `Paquete entregado a: ${createEntregaDto.nombreRecibe} (CI: ${createEntregaDto.ciRecibe}).`,
    });
    await this.seguimientosRepository.save(seguimiento);

    return this.findOne(envio.id);
  }
}
