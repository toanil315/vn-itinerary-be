import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './presentation/auth.controller';
import { LoginCommandHandler } from './application/commands/login/login.command-handler';
import { RegisterCommandHandler } from './application/commands/register/register.command-handler';
import { GetMeQueryHandler } from './application/queries/me/get-me.query-handler';
import { AuthRepository } from './domain/auth.repository';
import { PasswordHasher } from './domain/password-hasher';
import { TokenIssuer } from './domain/token-issuer';
import { AuthRepositoryImpl } from './infrastructure/auth.repository.impl';
import { Argon2PasswordHasherImpl } from './infrastructure/password-hasher.impl';
import { JwtTokenService } from './infrastructure/jwt-token.service';
import { RolePermissionPolicy } from './application/policy/role-permission.policy';
import { PermissionCheckService } from './application/policy/permission-check.service';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { PermissionGuard } from './infrastructure/guards/permission.guard';

@Module({
  imports: [CqrsModule],
  controllers: [AuthController],
  providers: [
    {
      provide: AuthRepository,
      useClass: AuthRepositoryImpl,
    },
    {
      provide: PasswordHasher,
      useClass: Argon2PasswordHasherImpl,
    },
    {
      provide: TokenIssuer,
      useClass: JwtTokenService,
    },
    RolePermissionPolicy,
    PermissionCheckService,
    LoginCommandHandler,
    RegisterCommandHandler,
    GetMeQueryHandler,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AuthModule {}
