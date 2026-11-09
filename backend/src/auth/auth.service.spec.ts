import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const findUnique = vi.fn();
  const signAsync = vi.fn();
  const service = new AuthService(
    { usuario: { findUnique } } as unknown as PrismaService,
    { signAsync } as unknown as JwtService,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects credentials for an unknown user', async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'unknown@example.com', senha: 'senha' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(signAsync).not.toHaveBeenCalled();
  });

  it('returns a signed token for valid credentials', async () => {
    const senha = 'senha-segura';
    const hashedPassword = await bcrypt.hash(senha, 4);
    findUnique.mockResolvedValue({
      id: 12,
      email: 'user@example.com',
      senha: hashedPassword,
    });
    signAsync.mockResolvedValue('signed.jwt.token');

    await expect(
      service.login({ email: 'user@example.com', senha }),
    ).resolves.toEqual({ access_token: 'signed.jwt.token' });
    expect(signAsync).toHaveBeenCalledWith({
      sub: 12,
      email: 'user@example.com',
    });
  });
});
