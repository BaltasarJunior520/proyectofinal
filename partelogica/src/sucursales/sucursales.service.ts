import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sucursal } from './entities/sucursal.entity';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';

@Injectable()
export class SucursalesService {
  constructor(
    @InjectRepository(Sucursal)
    private readonly sucursalesRepository: Repository<Sucursal>,
  ) {}

  async create(createSucursalDto: CreateSucursalDto): Promise<Sucursal> {
    const sucursal = this.sucursalesRepository.create(createSucursalDto);
    return this.sucursalesRepository.save(sucursal);
  }

  async findAll(): Promise<Sucursal[]> {
    return this.sucursalesRepository.find({ relations: { clientes: true } });
  }

  async findOne(id: number): Promise<Sucursal> {
    const sucursal = await this.sucursalesRepository.findOne({
      where: { id },
      relations: { clientes: true },
    });
    if (!sucursal) {
      throw new NotFoundException(`Sucursal con ID ${id} no encontrada.`);
    }
    return sucursal;
  }

  async update(
    id: number,
    updateSucursalDto: UpdateSucursalDto,
  ): Promise<Sucursal> {
    const sucursal = await this.findOne(id);
    this.sucursalesRepository.merge(sucursal, updateSucursalDto);
    return this.sucursalesRepository.save(sucursal);
  }

  async remove(id: number): Promise<void> {
    const sucursal = await this.findOne(id);
    await this.sucursalesRepository.remove(sucursal);
  }
}
