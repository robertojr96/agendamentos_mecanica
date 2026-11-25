import { Test, TestingModule } from '@nestjs/testing';
import { AgendaService } from './agenda.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('AgendaService', () => {
  let service: AgendaService;
  const prisma = {
    agenda: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgendaService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AgendaService>(AgendaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('reads appointments from Prisma and maps the API fields', async () => {
    prisma.agenda.findMany.mockResolvedValue([
      {
        id: 1,
        status: 'agendado',
        nome: 'João',
        aula: '2',
        hora: '2026-10-06T14:30:00.000Z',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await expect(service.findAll()).resolves.toMatchObject([
      {
        id: 1,
        nome: 'João',
        aula: 2,
        hora: new Date('2026-10-06T14:30:00.000Z'),
      },
    ]);
    expect(prisma.agenda.findMany).toHaveBeenCalledWith({
      orderBy: { hora: 'asc' },
    });
  });

  it('persists appointments with the database string representation', async () => {
    const now = new Date();
    prisma.agenda.create.mockResolvedValue({
      id: 1,
      status: 'agendado',
      nome: 'João',
      aula: '2',
      hora: '2026-10-06T14:30:00.000Z',
      createdAt: now,
      updatedAt: now,
    });

    await service.create({
      status: 'agendado',
      nome: 'João',
      aula: 2,
      hora: '2026-10-06T14:30:00.000Z',
    });

    expect(prisma.agenda.create).toHaveBeenCalledWith({
      data: {
        status: 'agendado',
        nome: 'João',
        aula: '2',
        hora: '2026-10-06T14:30:00.000Z',
      },
    });
  });

  it('updates an existing appointment and reports missing records', async () => {
    const now = new Date();
    prisma.agenda.findUnique.mockResolvedValue({ id: 1 });
    prisma.agenda.update.mockResolvedValue({
      id: 1,
      status: 'concluido',
      nome: 'João',
      aula: '2',
      hora: '2026-10-06T14:30:00.000Z',
      createdAt: now,
      updatedAt: now,
    });

    await service.update(1, { status: 'concluido' });
    expect(prisma.agenda.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: 'concluido' },
    });

    prisma.agenda.findUnique.mockResolvedValue(null);
    await expect(service.update(9, { status: 'concluido' })).rejects.toThrow(
      'Agenda 9 não encontrada',
    );
    expect(prisma.agenda.update).toHaveBeenCalledTimes(1);
  });
});
