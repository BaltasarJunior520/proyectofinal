import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { ContactoCliente } from './entities/contacto-cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Sucursal } from '../sucursales/entities/sucursal.entity';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clientesRepository: Repository<Cliente>,
    @InjectRepository(ContactoCliente)
    private readonly contactosRepository: Repository<ContactoCliente>,
    @InjectRepository(Sucursal)
    private readonly sucursalesRepository: Repository<Sucursal>,
  ) {}

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const existing = await this.clientesRepository.findOne({ where: { ci: createClienteDto.ci } });
    if (existing) {
      throw new BadRequestException(`El cliente con CI ${createClienteDto.ci} ya existe.`);
    }

    const { contactos, ...clienteData } = createClienteDto;
    const cliente = this.clientesRepository.create(clienteData);
    const savedCliente = await this.clientesRepository.save(cliente);

    if (contactos && contactos.length > 0) {
      const contactosEntities = contactos.map(c => this.contactosRepository.create({
        ...c,
        clienteId: savedCliente.id
      }));
      await this.contactosRepository.save(contactosEntities);
    }

    return this.findOne(savedCliente.id);
  }

  async findAll(): Promise<Cliente[]> {
    return this.clientesRepository.find({ relations: { contactos: true, sucursales: true } });
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clientesRepository.findOne({
      where: { id },
      relations: { contactos: true, sucursales: true },
    });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado.`);
    }
    return cliente;
  }

  async update(id: number, updateClienteDto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.findOne(id);
    
    if (updateClienteDto.ci && updateClienteDto.ci !== cliente.ci) {
      const existing = await this.clientesRepository.findOne({ where: { ci: updateClienteDto.ci } });
      if (existing) {
        throw new BadRequestException(`El cliente con CI ${updateClienteDto.ci} ya existe.`);
      }
    }

    const { contactos, ...clienteData } = updateClienteDto;
    this.clientesRepository.merge(cliente, clienteData);
    await this.clientesRepository.save(cliente);

    // Si se envían contactos, reemplazamos los anteriores en cascada
    if (contactos) {
      await this.contactosRepository.delete({ clienteId: id });
      if (contactos.length > 0) {
        const contactosEntities = contactos.map(c => this.contactosRepository.create({
          ...c,
          clienteId: id
        }));
        await this.contactosRepository.save(contactosEntities);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const cliente = await this.findOne(id);
    await this.clientesRepository.remove(cliente);
  }

  async associateSucursal(clienteId: number, sucursalId: number): Promise<Cliente> {
    const cliente = await this.findOne(clienteId);
    const sucursal = await this.sucursalesRepository.findOne({ where: { id: sucursalId } });
    if (!sucursal) {
      throw new NotFoundException(`Sucursal con ID ${sucursalId} no encontrada.`);
    }

    if (!cliente.sucursales) {
      cliente.sucursales = [];
    }

    if (!cliente.sucursales.some(s => s.id === sucursalId)) {
      cliente.sucursales.push(sucursal);
      await this.clientesRepository.save(cliente);
    }

    return this.findOne(clienteId);
  }

  async dissociateSucursal(clienteId: number, sucursalId: number): Promise<Cliente> {
    const cliente = await this.findOne(clienteId);
    if (!cliente.sucursales || !cliente.sucursales.some(s => s.id === sucursalId)) {
      throw new BadRequestException(`El cliente no está asociado a la sucursal con ID ${sucursalId}.`);
    }

    cliente.sucursales = cliente.sucursales.filter(s => s.id !== sucursalId);
    await this.clientesRepository.save(cliente);
    return this.findOne(clienteId);
  }
}
