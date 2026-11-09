import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import type { Request } from 'express';
import { AuthGuard } from './auth.guard.js';

describe('AuthGuard', () => {
  const verifyAsync = vi.fn();
  let guard: AuthGuard;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: { verifyAsync } },
      ],
    }).compile();
    guard = module.get(AuthGuard);
  });

  function executionContext(authorization?: string): ExecutionContext {
    const request = {
      headers: authorization ? { authorization } : {},
    } as Request;

    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext;
  }

  it('rejects requests without a bearer token', async () => {
    await expect(guard.canActivate(executionContext())).rejects.toThrow(
      'Unauthorized',
    );
    expect(verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects tokens that cannot be verified', async () => {
    verifyAsync.mockRejectedValue(new Error('Invalid token'));

    await expect(
      guard.canActivate(executionContext('Bearer invalid-token')),
    ).rejects.toThrow('Unauthorized');
  });

  it('accepts a verified token with the expected claims', async () => {
    verifyAsync.mockResolvedValue({ sub: 12, email: 'user@example.com' });

    await expect(
      guard.canActivate(executionContext('Bearer valid-token')),
    ).resolves.toBe(true);
    expect(verifyAsync).toHaveBeenCalledWith('valid-token', {
      algorithms: ['HS256'],
    });
  });
});
