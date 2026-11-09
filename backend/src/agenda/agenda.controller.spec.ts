import { Test, TestingModule } from '@nestjs/testing';
import { AgendaController } from './agenda.controller.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { AgendaService } from './agenda.service.js';

describe('AgendaController', () => {
  let controller: AgendaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgendaController],
      providers: [AgendaService],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: vi.fn(() => true) })
      .compile();

    controller = module.get<AgendaController>(AgendaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
