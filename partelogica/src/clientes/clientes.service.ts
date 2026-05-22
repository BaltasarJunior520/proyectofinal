import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { ContactoCliente } from './entities/contacto-cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { CreateContactoClienteDto } from './dto/create-contacto-cliente.dto';
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
    await this.ensureCiIsUnique(createClienteDto.ci);

    const { contactos, ...clienteData } = createClienteDto;
    const cliente = this.clientesRepository.create(clienteData);
    const savedCliente = await this.clientesRepository.save(cliente);

    if (contactos && contactos.length > 0) {
      await this.saveContactos(contactos, savedCliente.id);
    }

    return this.findOne(savedCliente.id);
  }

  async findAll(): Promise<Cliente[]> {
    return this.clientesRepository.find({
      relations: { contactos: true, sucursales: true },
    });
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

  async update(
    id: number,
    updateClienteDto: UpdateClienteDto,
  ): Promise<Cliente> {
    const cliente = await this.findOne(id);

    if (updateClienteDto.ci && updateClienteDto.ci !== cliente.ci) {
      await this.ensureCiIsUnique(updateClienteDto.ci);
    }

    const { contactos, ...clienteData } = updateClienteDto;
    this.clientesRepository.merge(cliente, clienteData);
    await this.clientesRepository.save(cliente);

    if (contactos) {
      await this.contactosRepository.delete({ clienteId: id });
      if (contactos.length > 0) {
        await this.saveContactos(contactos, id);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const cliente = await this.findOne(id);
    await this.clientesRepository.remove(cliente);
  }

  private async ensureCiIsUnique(ci?: string): Promise<void> {
    if (!ci) return;
    const existing = await this.clientesRepository.findOne({ where: { ci } });
    if (existing) {
      throw new BadRequestException(`El cliente con CI ${ci} ya existe.`);
    }
  }

  private async saveContactos(
    contactos: CreateContactoClienteDto[],
    clienteId: number,
  ): Promise<void> {
    const entities = contactos.map((c) =>
      this.contactosRepository.create({ ...c, clienteId }),
    );
    await this.contactosRepository.save(entities);
  }

  async associateSucursal(
    clienteId: number,
    sucursalId: number,
  ): Promise<Cliente> {
    const cliente = await this.findOne(clienteId);
    const sucursal = await this.sucursalesRepository.findOne({
      where: { id: sucursalId },
    });
    if (!sucursal) {
      throw new NotFoundException(
        `Sucursal con ID ${sucursalId} no encontrada.`,
      );
    }

    if (!cliente.sucursales) {
      cliente.sucursales = [];
    }

    if (!cliente.sucursales.some((s) => s.id === sucursalId)) {
      cliente.sucursales.push(sucursal);
      await this.clientesRepository.save(cliente);
    }

    return this.findOne(clienteId);
  }

  async dissociateSucursal(
    clienteId: number,
    sucursalId: number,
  ): Promise<Cliente> {
    const cliente = await this.findOne(clienteId);
    if (
      !cliente.sucursales ||
      !cliente.sucursales.some((s) => s.id === sucursalId)
    ) {
      throw new BadRequestException(
        `El cliente no está asociado a la sucursal con ID ${sucursalId}.`,
      );
    }

    cliente.sucursales = cliente.sucursales.filter((s) => s.id !== sucursalId);
    await this.clientesRepository.save(cliente);
    return this.findOne(clienteId);
  }
}
