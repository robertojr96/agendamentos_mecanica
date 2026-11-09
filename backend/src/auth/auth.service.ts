import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (!user || !(await bcrypt.compare(dto.senha, user.senha))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
    });

    return { access_token: accessToken };
  }
}
