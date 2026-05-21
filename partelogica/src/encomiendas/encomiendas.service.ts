import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Encomienda } from './entities/encomienda.entity';
import { DetalleEncomienda } from './entities/detalle-encomienda.entity';
import { Seguro } from './entities/seguro.entity';
import { CreateEncomiendaDto } from './dto/create-encomienda.dto';
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
      // 1. Validar Clientes
      const remitente = await queryRunner.manager.findOne(Cliente, { where: { id: createEncomiendaDto.remitenteId } });
      if (!remitente) {
        throw new NotFoundException(`Cliente Remitente con ID ${createEncomiendaDto.remitenteId} no existe.`);
      }

      const destinatario = await queryRunner.manager.findOne(Cliente, { where: { id: createEncomiendaDto.destinatarioId } });
      if (!destinatario) {
        throw new NotFoundException(`Cliente Destinatario con ID ${createEncomiendaDto.destinatarioId} no existe.`);
      }

      // 2. Validar duplicidad de código
      const duplicate = await queryRunner.manager.findOne(Encomienda, { where: { codigo: createEncomiendaDto.codigo } });
      if (duplicate) {
        throw new BadRequestException(`La encomienda con código ${createEncomiendaDto.codigo} ya está registrada.`);
      }

      // 3. Crear e insertar Encomienda
      const { detalles, seguro, ...encomiendaData } = createEncomiendaDto;
      const encomienda = queryRunner.manager.create(Encomienda, encomiendaData);
      const savedEncomienda = await queryRunner.manager.save(Encomienda, encomienda);

      // 4. Crear e insertar Detalles
      if (!detalles || detalles.length === 0) {
        throw new BadRequestException('La encomienda debe tener al menos un detalle de paquete.');
      }

      for (const d of detalles) {
        // Validar tipo de paquete
        const tipo = await queryRunner.manager.findOne(TipoPaquete, { where: { id: d.tipoId } });
        if (!tipo) {
          throw new NotFoundException(`Tipo de paquete con ID ${d.tipoId} no existe.`);
        }

        const detalle = queryRunner.manager.create(DetalleEncomienda, {
          ...d,
          encomiendaId: savedEncomienda.id,
        });
        await queryRunner.manager.save(DetalleEncomienda, detalle);
      }

      // 5. Crear e insertar Seguro
      if (seguro) {
        const seguroEntity = queryRunner.manager.create(Seguro, {
          ...seguro,
          encomiendaId: savedEncomienda.id,
        });
        await queryRunner.manager.save(Seguro, seguroEntity);
      }

      await queryRunner.commitTransaction();

      // Devolver la encomienda completa con relaciones
      return await this.findOneInternal(savedEncomienda.id, queryRunner.manager);
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

  private async findOneInternal(id: number, manager: any): Promise<Encomienda> {
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

  async update(id: number, updateEncomiendaDto: UpdateEncomiendaDto): Promise<Encomienda> {
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

      // Actualizar metadatos de encomienda
      queryRunner.manager.merge(Encomienda, encomienda, encomiendaData);
      await queryRunner.manager.save(Encomienda, encomienda);

      // Actualizar detalles si vienen en el update
      if (detalles) {
        // Eliminar detalles existentes
        await queryRunner.manager.delete(DetalleEncomienda, { encomiendaId: id });

        for (const d of detalles) {
          const tipo = await queryRunner.manager.findOne(TipoPaquete, { where: { id: d.tipoId } });
          if (!tipo) {
            throw new NotFoundException(`Tipo de paquete con ID ${d.tipoId} no existe.`);
          }
          const detalle = queryRunner.manager.create(DetalleEncomienda, {
            ...d,
            encomiendaId: id,
          });
          await queryRunner.manager.save(DetalleEncomienda, detalle);
        }
      }

      // Actualizar seguro si viene en el update
      if (seguro) {
        let seguroEntity = await queryRunner.manager.findOne(Seguro, { where: { encomiendaId: id } });
        if (seguroEntity) {
          queryRunner.manager.merge(Seguro, seguroEntity, seguro);
          await queryRunner.manager.save(Seguro, seguroEntity);
        } else {
          const newSeguro = queryRunner.manager.create(Seguro, { ...seguro, encomiendaId: id });
          await queryRunner.manager.save(Seguro, newSeguro);
        }
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
}
