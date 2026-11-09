import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { AgendaService } from './agenda.service.js';
import { CreateAgendaDto } from './dto/create-agenda.dto.js';
import { UpdateAgendaDto } from './dto/update-agenda.dto.js';

@Controller('agenda')
@UseGuards(AuthGuard)
export class AgendaController {
  constructor(private readonly service: AgendaService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateAgendaDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAgendaDto) {
    return this.service.update(id, dto);
  }
}
