import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAgendaDto } from './dto/create-agenda.dto.js';
import { UpdateAgendaDto } from './dto/update-agenda.dto.js';

@Injectable()
export class AgendaService {
    private agenda: any[] = [
        { id: 1, status: 'agendado', aula: 1, hora: new Date('2026-08-20T20:00:00Z') },
        { id: 2, status: 'agendado', aula: 2, hora: new Date('2026-08-21T20:00:00Z') },
    ];

    findAll() {
        return this.agenda;
    }

    create(dto: CreateAgendaDto) {
        const nova = {
            id: this.agenda.length + 1,
            ...dto,
            hora: new Date(dto.hora),
        };
        this.agenda.push(nova);
        return nova;
    }

    update(id: number, dto: UpdateAgendaDto) {
        const item = this.agenda.find((a) => a.id === id);
        if (!item) throw new NotFoundException(`Agenda ${id} não encontrada`);
        Object.assign(item, dto, dto.hora ? { hora: new Date(dto.hora) } : {});
        return item;
    }
}

