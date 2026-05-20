import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EncomiendasService } from './encomiendas.service';
import { Encomienda } from './entities/encomienda.entity';
import { DetalleEncomienda } from './entities/detalle-encomienda.entity';
import { Seguro } from './entities/seguro.entity';
import { TipoPaquete } from './entities/tipo-paquete.entity';
import { DataSource } from 'typeorm';
import { Cliente } from '../clientes/entities/cliente.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('EncomiendasService', () => {
  let service: EncomiendasService;
  let mockDataSource: any;
  let mockQueryRunner: any;

  beforeEach(async () => {
    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(null),
      startTransaction: jest.fn().mockResolvedValue(null),
      commitTransaction: jest.fn().mockResolvedValue(null),
      rollbackTransaction: jest.fn().mockResolvedValue(null),
      release: jest.fn().mockResolvedValue(null),
      manager: {
        findOne: jest.fn(),
        create: jest.fn((entityClass, data) => data),
        save: jest.fn((entityClass, data) => ({ id: 99, ...data })),
      },
    };

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncomiendasService,
        {
          provide: getRepositoryToken(Encomienda),
          useValue: {},
        },
        {
          provide: getRepositoryToken(DetalleEncomienda),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Seguro),
          useValue: {},
        },
        {
          provide: getRepositoryToken(TipoPaquete),
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<EncomiendasService>(EncomiendasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear una encomienda con detalles y seguro en una transacción exitosa', async () => {
      const createDto = {
        codigo: 'ENC100',
        remitenteId: 1,
        destinatarioId: 2,
        descripcion: 'Paquete de prueba',
        peso: 5,
        volumen: 0.5,
        valorDeclarado: 100,
        detalles: [{ tipoId: 1, cantidad: 1, observaciones: 'Sin observaciones' }],
        seguro: { monto: 10, descripcion: 'Seguro de prueba' },
      };

      // Simular que existen los clientes y el tipo de paquete
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce({ id: 1 }) // Remitente
        .mockResolvedValueOnce({ id: 2 }) // Destinatario
        .mockResolvedValueOnce(null)      // Duplicado de código (null significa no duplicado)
        .mockResolvedValueOnce({ id: 1 }) // Tipo de paquete en el loop
        .mockResolvedValueOnce({ id: 99, ...createDto }); // Retorno final de findOneInternal

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('debería hacer rollback si falla la validación del remitente', async () => {
      const createDto = {
        codigo: 'ENC100',
        remitenteId: 99,
        destinatarioId: 2,
        detalles: [{ tipoId: 1, cantidad: 1 }],
      };

      // Simular que el remitente no existe
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(null);

      await expect(service.create(createDto as any)).rejects.toThrow(NotFoundException);

      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('debería hacer rollback si el código de la encomienda ya está duplicado', async () => {
      const createDto = {
        codigo: 'ENC_EXISTE',
        remitenteId: 1,
        destinatarioId: 2,
        detalles: [{ tipoId: 1, cantidad: 1 }],
      };

      // Simular que existen clientes pero el código está duplicado
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce({ id: 1 }) // Remitente
        .mockResolvedValueOnce({ id: 2 }) // Destinatario
        .mockResolvedValueOnce({ id: 5, codigo: 'ENC_EXISTE' }); // Duplicado de código

      await expect(service.create(createDto as any)).rejects.toThrow(BadRequestException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });
});
