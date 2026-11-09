import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { StatusAgenda } from './create-agenda.dto.js';

export class UpdateAgendaDto {
  @IsOptional()
  @IsEnum(StatusAgenda, { message: 'status inválido' })
  status?: StatusAgenda;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nome?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  aula?: number;

  @IsOptional()
  @IsDateString({}, { message: 'hora deve estar no formato ISO' })
  hora?: string;
}
