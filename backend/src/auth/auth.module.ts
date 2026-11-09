import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.getOrThrow<string>('JWT_SECRET');
        if (Buffer.byteLength(secret) < 32) {
          throw new Error('JWT_SECRET must be at least 32 bytes long');
        }

        return {
          global: true,
          secret,
          signOptions: { expiresIn: '8h', algorithm: 'HS256' as const },
        };
      },
    }),
  ],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthGuard, JwtModule],
})
export class AuthModule {}
