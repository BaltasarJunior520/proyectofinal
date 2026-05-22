import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EnviosService } from './envios.service';
import { Envio } from './entities/envio.entity';
import { EstadoEnvio } from './entities/estado-envio.entity';
import { Entrega } from './entities/entrega.entity';
import { Encomienda } from '../encomiendas/entities/encomienda.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity';
import { Seguimiento } from '../seguimientos/entities/seguimiento.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

interface MockRepository<T = any> {
  findOne?: jest.Mock<Promise<T | null>, [any]>;
  find?: jest.Mock<Promise<T[]>, [any]>;
  create?: jest.Mock<T, [any]>;
  save?: jest.Mock<T | Promise<T>, [any]>;
  update?: jest.Mock;
  delete?: jest.Mock;
}

describe('EnviosService', () => {
  let service: EnviosService;
  let enviosRepository: MockRepository<Envio>;
  let encomiendasRepository: MockRepository<Encomienda>;
  let sucursalesRepository: MockRepository<Sucursal>;
  let estadosRepository: MockRepository<EstadoEnvio>;
  let seguimientosRepository: MockRepository<Seguimiento>;

  beforeEach(async () => {
    enviosRepository = {
      findOne: jest.fn(),
      create: jest.fn((data: Record<string, unknown>) => data),
      save: jest.fn((data: Record<string, unknown>) => ({ id: 50, ...data })),
    };
    encomiendasRepository = {
      findOne: jest.fn(),
    };
    sucursalesRepository = {
      findOne: jest.fn(),
    };
    estadosRepository = {
      findOne: jest.fn(),
    };
    seguimientosRepository = {
      create: jest.fn((data: Record<string, unknown>) => data),
      save: jest.fn((data: Record<string, unknown>) => data),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnviosService,
        {
          provide: getRepositoryToken(Envio),
          useValue: enviosRepository,
        },
        {
          provide: getRepositoryToken(EstadoEnvio),
          useValue: estadosRepository,
        },
        {
          provide: getRepositoryToken(Entrega),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Encomienda),
          useValue: encomiendasRepository,
        },
        {
          provide: getRepositoryToken(Sucursal),
          useValue: sucursalesRepository,
        },
        {
          provide: getRepositoryToken(Seguimiento),
          useValue: seguimientosRepository,
        },
      ],
    }).compile();

    service = module.get<EnviosService>(EnviosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería registrar un envío y crear el primer seguimiento automático si los datos son correctos', async () => {
      const createDto = {
        encomiendaId: 10,
        sucursalOrigenId: 1,
        sucursalDestinoId: 2,
        costo: 45.5,
      };

      // Simular que la encomienda existe
      encomiendasRepository.findOne.mockResolvedValue({ id: 10 });
      // Simular que no hay un envío previo para esa encomienda
      enviosRepository.findOne.mockResolvedValue(null);
      // Simular que existen las sucursales
      sucursalesRepository.findOne
        .mockResolvedValueOnce({ id: 1, nombre: 'La Paz' })
        .mockResolvedValueOnce({ id: 2, nombre: 'Cochabamba' });
      // Simular que el estado "Registrado" (1) existe
      estadosRepository.findOne.mockResolvedValue({
        id: 1,
        nombre: 'Registrado',
      });

      // Simular que findOne devuelve el envío creado
      enviosRepository.findOne.mockImplementation(
        (options: { where: { id: number } }) => {
          if (options.where.id === 50) {
            return Promise.resolve({
              id: 50,
              ...createDto,
              estadoId: 1,
            } as Envio);
          }
          return Promise.resolve(null);
        },
      );

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(50);
      expect(encomiendasRepository.findOne).toHaveBeenCalledWith({
        where: { id: 10 },
      });
      expect(seguimientosRepository.create).toHaveBeenCalled();
      expect(seguimientosRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si la encomienda no existe', async () => {
      const createDto = {
        encomiendaId: 999,
        costo: 50,
      };

      encomiendasRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería lanzar BadRequestException si la encomienda ya tiene un envío registrado', async () => {
      const createDto = {
        encomiendaId: 10,
        costo: 50,
      };

      encomiendasRepository.findOne.mockResolvedValue({ id: 10 });
      enviosRepository.findOne.mockResolvedValue({ id: 80, encomiendaId: 10 }); // Envío previo existente

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
