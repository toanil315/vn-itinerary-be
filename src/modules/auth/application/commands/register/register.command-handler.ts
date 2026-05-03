import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '@/common/domain/result';
import { AuthErrors } from '@/modules/auth/domain/auth.error';
import { AuthRepository } from '@/modules/auth/domain/auth.repository';
import { PasswordHasher } from '@/modules/auth/domain/password-hasher';
import { RegisterCommand } from './register.command';
import { RegisterData } from './register.dto';

@CommandHandler(RegisterCommand)
export class RegisterCommandHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: RegisterCommand): Promise<Result<RegisterData>> {
    const { username, email, password, displayName } = command;

    // 1. Check if email exists
    const existingEmail = await this.authRepository.findByEmail(email);
    if (existingEmail) {
      return Result.failure(AuthErrors.EmailAlreadyExists());
    }

    // 2. Check if username taken
    const existingUsername = await this.authRepository.findByUsername(username);
    if (existingUsername) {
      return Result.failure(AuthErrors.UsernameTaken());
    }

    // 3. Hash password
    const passwordHash = await this.passwordHasher.hash(password);

    // 4. Create user
    const user = await this.authRepository.createUser({
      email,
      username,
      passwordHash,
      displayName: displayName ?? username,
    });

    return Result.success(user);
  }
}
