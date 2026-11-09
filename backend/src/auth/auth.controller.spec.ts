import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';

describe('AuthController', () => {
  it('passes login credentials to the auth service', async () => {
    const login = vi.fn().mockResolvedValue({ access_token: 'token' });
    const controller = new AuthController({ login } as unknown as AuthService);
    const dto = { email: 'user@example.com', senha: 'senha' };

    await expect(controller.login(dto)).resolves.toEqual({
      access_token: 'token',
    });
    expect(login).toHaveBeenCalledWith(dto);
  });
});
