import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

interface JwtClaims {
  sub: number;
  email: string;
}

type AuthenticatedRequest = Request & { user?: JwtClaims };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const match =
      typeof authorization === 'string'
        ? /^Bearer\s+(\S+)$/i.exec(authorization)
        : null;

    if (!match) {
      throw new UnauthorizedException();
    }

    let claims: JwtClaims;
    try {
      claims = await this.jwt.verifyAsync<JwtClaims>(match[1], {
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedException();
    }

    if (!Number.isInteger(claims.sub) || typeof claims.email !== 'string') {
      throw new UnauthorizedException();
    }

    request.user = claims;
    return true;
  }
}
