import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Encomienda } from './entities/encomienda.entity';
import { DetalleEncomienda } from './entities/detalle-encomienda.entity';
import { Seguro } from './entities/seguro.entity';
import { CreateEncomiendaDto } from './dto/create-encomienda.dto';
import { CreateDetalleEncomiendaDto } from './dto/create-detalle-encomienda.dto';
import { CreateSeguroDto } from './dto/create-seguro.dto';
import { UpdateEncomiendaDto } from './dto/update-encomienda.dto';
import { Cliente } from '../clientes/entities/cliente.entity';
import { TipoPaquete } from './entities/tipo-paquete.entity';

@Injectable()
export class EncomiendasService {
  constructor(
    @InjectRepository(Encomienda)
    private readonly encomiendasRepository: Repository<Encomienda>,
    @InjectRepository(DetalleEncomienda)
    private readonly detallesRepository: Repository<DetalleEncomienda>,
    @InjectRepository(Seguro)
    private readonly segurosRepository: Repository<Seguro>,
    @InjectRepository(TipoPaquete)
    private readonly tipoPaqueteRepository: Repository<TipoPaquete>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createEncomiendaDto: CreateEncomiendaDto): Promise<Encomienda> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.validateClientesExistence(
        queryRunner,
        createEncomiendaDto.remitenteId,
        createEncomiendaDto.destinatarioId,
      );
      await this.ensureCodigoIsUnique(queryRunner, createEncomiendaDto.codigo);

      const { detalles, seguro, ...encomiendaData } = createEncomiendaDto;
      const encomienda = queryRunner.manager.create(Encomienda, encomiendaData);
      const savedEncomienda = await queryRunner.manager.save(
        Encomienda,
        encomienda,
      );

      await this.createDetalles(queryRunner, detalles, savedEncomienda.id);
      await this.createSeguroIfPresent(queryRunner, seguro, savedEncomienda.id);

      await queryRunner.commitTransaction();
      return await this.findOneInternal(
        savedEncomienda.id,
        queryRunner.manager,
      );
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Encomienda[]> {
    return this.encomiendasRepository.find({
      relations: {
        remitente: true,
        destinatario: true,
        detalles: { tipoPaquete: true },
        seguro: true,
      },
    });
  }

  async findOne(id: number): Promise<Encomienda> {
    const encomienda = await this.encomiendasRepository.findOne({
      where: { id },
      relations: {
        remitente: true,
        destinatario: true,
        detalles: { tipoPaquete: true },
        seguro: true,
      },
    });
    if (!encomienda) {
      throw new NotFoundException(`Encomienda con ID ${id} no encontrada.`);
    }
    return encomienda;
  }

  private async findOneInternal(
    id: number,
    manager: EntityManager,
  ): Promise<Encomienda> {
    const encomienda = await manager.findOne(Encomienda, {
      where: { id },
      relations: {
        remitente: true,
        destinatario: true,
        detalles: { tipoPaquete: true },
        seguro: true,
      },
    });
    if (!encomienda) {
      throw new NotFoundException(`Encomienda con ID ${id} no encontrada.`);
    }
    return encomienda;
  }

  async update(
    id: number,
    updateEncomiendaDto: UpdateEncomiendaDto,
  ): Promise<Encomienda> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const encomienda = await queryRunner.manager.findOne(Encomienda, {
        where: { id },
        relations: { detalles: true, seguro: true },
      });
      if (!encomienda) {
        throw new NotFoundException(`Encomienda con ID ${id} no encontrada.`);
      }

      const { detalles, seguro, ...encomiendaData } = updateEncomiendaDto;

      queryRunner.manager.merge(Encomienda, encomienda, encomiendaData);
      await queryRunner.manager.save(Encomienda, encomienda);

      if (detalles) {
        await queryRunner.manager.delete(DetalleEncomienda, {
          encomiendaId: id,
        });
        await this.createDetalles(queryRunner, detalles, id);
      }

      if (seguro) {
        await this.upsertSeguro(queryRunner, seguro, id);
      }

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    const encomienda = await this.findOne(id);
    await this.encomiendasRepository.remove(encomienda);
  }

  private async validateClientesExistence(
    manager: EntityManager,
    remitenteId: number,
    destinatarioId: number,
  ): Promise<void> {
    const remitente = await manager.findOne(Cliente, {
      where: { id: remitenteId },
    });
    if (!remitente) {
      throw new NotFoundException(
        `Cliente Remitente con ID ${remitenteId} no existe.`,
      );
    }
    const destinatario = await manager.findOne(Cliente, {
      where: { id: destinatarioId },
    });
    if (!destinatario) {
      throw new NotFoundException(
        `Cliente Destinatario con ID ${destinatarioId} no existe.`,
      );
    }
  }

  private async ensureCodigoIsUnique(
    manager: EntityManager,
    codigo: string,
  ): Promise<void> {
    const duplicate = await manager.findOne(Encomienda, { where: { codigo } });
    if (duplicate) {
      throw new BadRequestException(
        `La encomienda con código ${codigo} ya está registrada.`,
      );
    }
  }

  private async createDetalles(
    manager: EntityManager,
    detalles: CreateDetalleEncomiendaDto[],
    encomiendaId: number,
  ): Promise<void> {
    if (!detalles || detalles.length === 0) {
      throw new BadRequestException(
        'La encomienda debe tener al menos un detalle de paquete.',
      );
    }

    for (const d of detalles) {
      const tipo = await manager.findOne(TipoPaquete, {
        where: { id: d.tipoId },
      });
      if (!tipo) {
        throw new NotFoundException(
          `Tipo de paquete con ID ${d.tipoId} no existe.`,
        );
      }
      const detalle = manager.create(DetalleEncomienda, { ...d, encomiendaId });
      await manager.save(DetalleEncomienda, detalle);
    }
  }

  private async createSeguroIfPresent(
    manager: EntityManager,
    seguro: CreateSeguroDto | undefined,
    encomiendaId: number,
  ): Promise<void> {
    if (!seguro) return;
    const seguroEntity = manager.create(Seguro, { ...seguro, encomiendaId });
    await manager.save(Seguro, seguroEntity);
  }

  private async upsertSeguro(
    manager: EntityManager,
    seguro: CreateSeguroDto,
    encomiendaId: number,
  ): Promise<void> {
    const seguroEntity = await manager.findOne(Seguro, {
      where: { encomiendaId },
    });
    if (seguroEntity) {
      manager.merge(Seguro, seguroEntity, seguro);
      await manager.save(Seguro, seguroEntity);
    } else {
      const newSeguro = manager.create(Seguro, { ...seguro, encomiendaId });
      await manager.save(Seguro, newSeguro);
    }
  }
}
