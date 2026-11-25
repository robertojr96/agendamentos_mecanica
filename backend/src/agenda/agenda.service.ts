import { Injectable, NotFoundException } from '@nestjs/common';
import type { AgendaModel } from '../generated/prisma/models/Agenda.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAgendaDto } from './dto/create-agenda.dto.js';
import { UpdateAgendaDto } from './dto/update-agenda.dto.js';

@Injectable()
export class AgendaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const agendas = await this.prisma.agenda.findMany({
      orderBy: { hora: 'asc' },
    });
    return agendas.map((agenda) => this.toResponse(agenda));
  }

  async create(dto: CreateAgendaDto) {
    const agenda = await this.prisma.agenda.create({
      data: {
        status: dto.status,
        nome: dto.nome,
        aula: String(dto.aula),
        hora: dto.hora,
      },
    });
    return this.toResponse(agenda);
  }

  async update(id: number, dto: UpdateAgendaDto) {
    const existing = await this.prisma.agenda.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Agenda ${id} não encontrada`);
    }

    const agenda = await this.prisma.agenda.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.nome !== undefined && { nome: dto.nome }),
        ...(dto.aula !== undefined && { aula: String(dto.aula) }),
        ...(dto.hora !== undefined && { hora: dto.hora }),
      },
    });
    return this.toResponse(agenda);
  }

  private toResponse(agenda: AgendaModel) {
    return {
      ...agenda,
      aula: Number(agenda.aula),
      hora: new Date(agenda.hora),
    };
  }
}

