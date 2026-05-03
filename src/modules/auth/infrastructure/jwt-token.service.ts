import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt, { JwtPayload } from 'jsonwebtoken';
import {
  AccessTokenIssueResult,
  AccessTokenPayload,
  TokenIssuer,
} from '@/modules/auth/domain/token-issuer';

@Injectable()
export class JwtTokenService implements TokenIssuer {
  private readonly accessTokenSecret: string;
  private readonly issuer?: string;
  private readonly audience?: string;

  private static readonly ACCESS_TOKEN_EXPIRES_IN_SECONDS = 60 * 60 * 4;

  constructor(private readonly configService: ConfigService) {
    this.accessTokenSecret =
      this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
    this.issuer = this.configService.get<string>(
      'JWT_ISSUER',
      'vn-itinerary-api',
    );
    this.audience = this.configService.get<string>(
      'JWT_AUDIENCE',
      'vn-itinerary-users',
    );
  }

  async issueAccessToken(
    payload: AccessTokenPayload,
  ): Promise<AccessTokenIssueResult> {
    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      algorithm: 'HS256',
      expiresIn: JwtTokenService.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      issuer: this.issuer,
      audience: this.audience,
    });

    return {
      accessToken,
      expiresInSeconds: JwtTokenService.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    };
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const decoded = jwt.verify(token, this.accessTokenSecret, {
      algorithms: ['HS256'],
      issuer: this.issuer,
      audience: this.audience,
    });

    if (typeof decoded === 'string') {
      throw new Error('Invalid JWT payload');
    }

    const payload = decoded as JwtPayload;

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.roleKey !== 'string'
    ) {
      throw new Error('Invalid JWT claims');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      roleKey: payload.roleKey,
    };
  }
}
