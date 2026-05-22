import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
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
    await this.validateEncomiendaExists(createEnvioDto.encomiendaId);
    await this.ensureNoExistingEnvio(createEnvioDto.encomiendaId);
    await this.validateSucursalesExistence(
      createEnvioDto.sucursalOrigenId,
      createEnvioDto.sucursalDestinoId,
    );

    const estadoId =
      createEnvioDto.estadoId ?? (await this.getEstadoIdByNombre('Registrado'));
    await this.validateEstadoExists(estadoId);

    const envio = this.enviosRepository.create({
      ...createEnvioDto,
      estadoId,
      fechaEnvio: createEnvioDto.fechaEnvio
        ? new Date(createEnvioDto.fechaEnvio)
        : new Date(),
      fechaEstimada: createEnvioDto.fechaEstimada
        ? new Date(createEnvioDto.fechaEstimada)
        : null,
    });
    const savedEnvio = await this.enviosRepository.save(envio);

    await this.createInitialSeguimiento(
      savedEnvio.id,
      estadoId,
      createEnvioDto.sucursalOrigenId,
    );

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
      const estado = await this.estadosRepository.findOne({
        where: { id: updateEnvioDto.estadoId },
      });
      if (!estado) {
        throw new NotFoundException(
          `Estado de envío con ID ${updateEnvioDto.estadoId} no existe.`,
        );
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
      throw new BadRequestException(
        `El envío con ID ${createEntregaDto.envioId} ya ha sido entregado.`,
      );
    }

    const entrega = this.entregasRepository.create({
      ...createEntregaDto,
      fechaEntrega: createEntregaDto.fechaEntrega
        ? new Date(createEntregaDto.fechaEntrega)
        : new Date(),
    });
    await this.entregasRepository.save(entrega);

    const entregadoId = await this.getEstadoIdByNombre('Entregado');
    envio.estadoId = entregadoId;
    await this.enviosRepository.save(envio);

    const seguimiento = this.seguimientosRepository.create({
      envioId: envio.id,
      estadoId: entregadoId,
      ubicacion: 'Destino Final',
      observaciones: `Paquete entregado a: ${createEntregaDto.nombreRecibe} (CI: ${createEntregaDto.ciRecibe}).`,
    });
    await this.seguimientosRepository.save(seguimiento);

    return this.findOne(envio.id);
  }

  private async validateEncomiendaExists(encomiendaId: number): Promise<void> {
    const encomienda = await this.encomiendasRepository.findOne({
      where: { id: encomiendaId },
    });
    if (!encomienda) {
      throw new NotFoundException(
        `La encomienda con ID ${encomiendaId} no existe.`,
      );
    }
  }

  private async ensureNoExistingEnvio(encomiendaId: number): Promise<void> {
    const existing = await this.enviosRepository.findOne({
      where: { encomiendaId },
    });
    if (existing) {
      throw new BadRequestException(
        `La encomienda con ID ${encomiendaId} ya tiene un envío registrado (Envío ID ${existing.id}).`,
      );
    }
  }

  private async validateSucursalesExistence(
    sucursalOrigenId?: number,
    sucursalDestinoId?: number,
  ): Promise<void> {
    if (sucursalOrigenId) {
      const origen = await this.sucursalesRepository.findOne({
        where: { id: sucursalOrigenId },
      });
      if (!origen) {
        throw new NotFoundException(
          `La sucursal de origen con ID ${sucursalOrigenId} no existe.`,
        );
      }
    }
    if (sucursalDestinoId) {
      const destino = await this.sucursalesRepository.findOne({
        where: { id: sucursalDestinoId },
      });
      if (!destino) {
        throw new NotFoundException(
          `La sucursal de destino con ID ${sucursalDestinoId} no existe.`,
        );
      }
    }
  }

  private async validateEstadoExists(estadoId: number): Promise<void> {
    const estado = await this.estadosRepository.findOne({
      where: { id: estadoId },
    });
    if (!estado) {
      throw new NotFoundException(
        `El estado de envío con ID ${estadoId} no existe.`,
      );
    }
  }

  private async createInitialSeguimiento(
    envioId: number,
    estadoId: number,
    sucursalOrigenId?: number,
  ): Promise<void> {
    let ubicacionInicial = 'Origen';
    if (sucursalOrigenId) {
      const origenSucursal = await this.sucursalesRepository.findOne({
        where: { id: sucursalOrigenId },
      });
      if (origenSucursal) {
        ubicacionInicial = origenSucursal.nombre;
      }
    }
    const seguimiento = this.seguimientosRepository.create({
      envioId,
      estadoId,
      ubicacion: ubicacionInicial,
      observaciones: 'Envío registrado en el sistema.',
    });
    await this.seguimientosRepository.save(seguimiento);
  }

  private async getEstadoIdByNombre(nombre: string): Promise<number> {
    const estado = await this.estadosRepository.findOne({ where: { nombre } });
    if (!estado) {
      throw new InternalServerErrorException(
        `Estado de envío '${nombre}' no encontrado en la base de datos.`,
      );
    }
    return estado.id;
  }
}
