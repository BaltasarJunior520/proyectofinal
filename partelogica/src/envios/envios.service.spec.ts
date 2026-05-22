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

describe('EnviosService', () => {
  let service: EnviosService;
  let enviosRepository: any;
  let encomiendasRepository: any;
  let sucursalesRepository: any;
  let estadosRepository: any;
  let seguimientosRepository: any;

  beforeEach(async () => {
    enviosRepository = {
      findOne: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn((data) => ({ id: 50, ...data })),
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
      create: jest.fn((data) => data),
      save: jest.fn((data) => data),
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
      enviosRepository.findOne.mockImplementation(async (options: any) => {
        if (options.where && options.where.id === 50) {
          return { id: 50, ...createDto, estadoId: 1 } as any;
        }
        return null;
      });

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
