import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@/common/domain/result';
import { AuthRepository } from '@/modules/auth/domain/auth.repository';
import { PasswordHasher } from '@/modules/auth/domain/password-hasher';
import { TokenIssuer } from '@/modules/auth/domain/token-issuer';
import { AuthErrors } from '@/modules/auth/domain/auth.error';
import { LoginCommand } from './login.command';
import { LoginData } from './login.dto';
import { isActiveUser } from '@/modules/auth/domain/user-identity';

@Injectable()
@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<
  LoginCommand,
  Result<LoginData>
> {
  constructor(
    @Inject(AuthRepository)
    private readonly authRepository: AuthRepository,
    @Inject(PasswordHasher)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TokenIssuer)
    private readonly tokenIssuer: TokenIssuer,
  ) {}

  async execute(command: LoginCommand): Promise<Result<LoginData>> {
    const user = await this.authRepository.findByEmail(command.email);

    if (!user) {
      return Result.failure(AuthErrors.InvalidCredentials());
    }

    if (!isActiveUser(user.status)) {
      return Result.failure(AuthErrors.InactiveUser());
    }

    const isPasswordValid = await this.passwordHasher.verify(
      command.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return Result.failure(AuthErrors.InvalidCredentials());
    }

    const token = await this.tokenIssuer.issueAccessToken({
      sub: user.id,
      email: user.email,
      roleKey: user.roleKey,
    });

    return Result.success({
      accessToken: token.accessToken,
      tokenType: 'Bearer',
      expiresInSeconds: token.expiresInSeconds,
    });
  }
}
