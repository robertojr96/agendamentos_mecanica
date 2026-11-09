import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-only-jwt-secret-at-least-32-bytes';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({ $connect: vi.fn(), $disconnect: vi.fn() })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/agenda (GET) rejects requests without a token', () => {
    return request(app.getHttpServer()).get('/agenda').expect(401);
  });

  it('/agenda (GET) accepts a valid token', async () => {
    const token = await app
      .get(JwtService)
      .signAsync({ sub: 1, email: 'user@example.com' });

    await request(app.getHttpServer())
      .get('/agenda')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  afterEach(async () => {
    await app.close();
  });
});
