import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BusinessError } from '@/common/domain/error';
import { Result } from '@/common/domain/result';
import { AuthRepository } from '@/modules/auth/domain/auth.repository';
import { UserProfileData } from './get-me.dto';
import { GetMeQuery } from './get-me.query';

@QueryHandler(GetMeQuery)
export class GetMeQueryHandler implements IQueryHandler<GetMeQuery> {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(query: GetMeQuery): Promise<Result<UserProfileData>> {
    const profile = await this.authRepository.findUserProfile(query.userId);

    if (!profile) {
      return Result.failure(
        BusinessError.NotFound('AUTH.USER_NOT_FOUND', 'User profile not found'),
      );
    }

    return Result.success(profile);
  }
}
