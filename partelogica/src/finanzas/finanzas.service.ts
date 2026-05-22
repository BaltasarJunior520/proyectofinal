import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from './entities/pago.entity';
import { Factura } from './entities/factura.entity';
import { Envio } from '../envios/entities/envio.entity';
import { CreatePagoDto } from './dto/create-pago.dto';

@Injectable()
export class FinanzasService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagosRepository: Repository<Pago>,
    @InjectRepository(Factura)
    private readonly facturasRepository: Repository<Factura>,
    @InjectRepository(Envio)
    private readonly enviosRepository: Repository<Envio>,
  ) {}

  async createPago(createPagoDto: CreatePagoDto): Promise<Pago> {
    const envio = await this.enviosRepository.findOne({
      where: { id: createPagoDto.envioId },
    });
    if (!envio) {
      throw new NotFoundException(
        `El envío con ID ${createPagoDto.envioId} no existe.`,
      );
    }

    const { factura, ...pagoData } = createPagoDto;
    const pago = this.pagosRepository.create(pagoData);
    const savedPago = await this.pagosRepository.save(pago);

    if (factura) {
      const facturaEntity = this.facturasRepository.create({
        ...factura,
        pagoId: savedPago.id,
      });
      await this.facturasRepository.save(facturaEntity);
    }

    return this.findPagoOne(savedPago.id);
  }

  async findAllPagos(): Promise<Pago[]> {
    return this.pagosRepository.find({
      relations: { envio: true, factura: true },
    });
  }

  async findPagoOne(id: number): Promise<Pago> {
    const pago = await this.pagosRepository.findOne({
      where: { id },
      relations: { envio: true, factura: true },
    });
    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado.`);
    }
    return pago;
  }

  async findAllFacturas(): Promise<Factura[]> {
    return this.facturasRepository.find({ relations: { pago: true } });
  }

  async findFacturaOne(id: number): Promise<Factura> {
    const factura = await this.facturasRepository.findOne({
      where: { id },
      relations: { pago: true },
    });
    if (!factura) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada.`);
    }
    return factura;
  }
}
