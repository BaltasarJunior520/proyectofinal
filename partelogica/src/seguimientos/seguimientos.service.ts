import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seguimiento } from './entities/seguimiento.entity';
import { Envio } from '../envios/entities/envio.entity';
import { EstadoEnvio } from '../envios/entities/estado-envio.entity';
import { CreateSeguimientoDto } from './dto/create-seguimiento.dto';

@Injectable()
export class SeguimientosService {
  constructor(
    @InjectRepository(Seguimiento)
    private readonly seguimientosRepository: Repository<Seguimiento>,
    @InjectRepository(Envio)
    private readonly enviosRepository: Repository<Envio>,
    @InjectRepository(EstadoEnvio)
    private readonly estadosRepository: Repository<EstadoEnvio>,
  ) {}

  async create(createSeguimientoDto: CreateSeguimientoDto): Promise<Seguimiento> {
    // 1. Validar Envio
    const envio = await this.enviosRepository.findOne({ where: { id: createSeguimientoDto.envioId } });
    if (!envio) {
      throw new NotFoundException(`El envío con ID ${createSeguimientoDto.envioId} no existe.`);
    }

    // 2. Validar Estado de Envío
    const estado = await this.estadosRepository.findOne({ where: { id: createSeguimientoDto.estadoId } });
    if (!estado) {
      throw new NotFoundException(`El estado de envío con ID ${createSeguimientoDto.estadoId} no existe.`);
    }

    // 3. Crear Seguimiento
    const seguimiento = this.seguimientosRepository.create(createSeguimientoDto);
    const savedSeguimiento = await this.seguimientosRepository.save(seguimiento);

    // 4. Actualizar el estado del envío principal de forma integrada
    envio.estadoId = createSeguimientoDto.estadoId;
    await this.enviosRepository.save(envio);

    return this.findOne(savedSeguimiento.id);
  }

  async findOne(id: number): Promise<Seguimiento> {
    const seguimiento = await this.seguimientosRepository.findOne({
      where: { id },
      relations: {
        envio: true,
        estado: true,
      },
    });
    if (!seguimiento) {
      throw new NotFoundException(`Seguimiento con ID ${id} no encontrado.`);
    }
    return seguimiento;
  }

  async findByEnvioId(envioId: number): Promise<Seguimiento[]> {
    // Verificar que exista el envío
    const exists = await this.enviosRepository.findOne({ where: { id: envioId } });
    if (!exists) {
      throw new NotFoundException(`El envío con ID ${envioId} no existe.`);
    }

    return this.seguimientosRepository.find({
      where: { envioId },
      relations: { estado: true },
      order: { fecha: 'DESC' },
    });
  }
}
