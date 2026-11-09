import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export enum StatusAgenda {
    AGENDADO = 'agendado',
    EM_ANDAMENTO = 'em_andamento',
    CONCLUIDO = 'concluido',
    CANCELADO = 'cancelado',
}

export class CreateAgendaDto {
    @IsEnum(StatusAgenda, { message: 'status inválido' })
    @IsNotEmpty()
    status: StatusAgenda;

    @IsString()
    @IsNotEmpty()
    nome: string;

    @IsInt()
    @Min(1)
    aula: number;

    @IsDateString({}, { message: 'hora deve estar no formato ISO (ex.: 2026-10-06T14:30:00Z)' })
    hora: string;
}