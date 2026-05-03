import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@/common/domain/result';
import { ApiZodResponse } from '@/common/http/api-zod-response.decorator';
import { LoginCommand } from '@/modules/auth/application/commands/login/login.command';
import {
  LoginData,
  LoginRequest,
  LoginResponse,
} from '@/modules/auth/application/commands/login/login.dto';
import { RegisterCommand } from '@/modules/auth/application/commands/register/register.command';
import {
  RegisterData,
  RegisterRequest,
  RegisterResponse,
} from '@/modules/auth/application/commands/register/register.dto';
import { UserProfileResponse } from '@/modules/auth/application/queries/me/get-me.dto';
import { GetMeQuery } from '@/modules/auth/application/queries/me/get-me.query';
import type { AuthenticatedUser } from '@/modules/auth/domain/user-identity';
import { CurrentUser } from '@/modules/auth/presentation/decorators/current-user.decorator';
import { Public } from '@/modules/auth/presentation/decorators/public.decorator';
import { RequirePermission } from '@/modules/auth/presentation/decorators/require-permission.decorator';
import { PermissionKeys } from '@/modules/auth/application/policy/permission-key';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login',
    description: 'Authenticate user and return JWT access token',
  })
  @ApiZodResponse({
    description: 'Login successful',
    type: LoginResponse,
    statusCode: 200,
  })
  async login(@Body() request: LoginRequest): Promise<Result<LoginData>> {
    return await this.commandBus.execute(
      new LoginCommand(request.email, request.password),
    );
  }

  @Public()
  @Post('register')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Register',
    description: 'Create a new user account',
  })
  @ApiZodResponse({
    description: 'Registration successful',
    type: RegisterResponse,
    statusCode: 201,
  })
  async register(
    @Body() request: RegisterRequest,
  ): Promise<Result<RegisterData>> {
    return await this.commandBus.execute(
      new RegisterCommand(
        request.username,
        request.email,
        request.password,
        request.displayName,
      ),
    );
  }

  @ApiBearerAuth()
  @RequirePermission(PermissionKeys.AUTH_PROFILE)
  @Get('me')
  @ApiOperation({
    summary: 'Get Current User',
    description: 'Returns the profile of the currently authenticated user',
  })
  @ApiZodResponse({
    description: 'Success',
    type: UserProfileResponse,
    statusCode: 200,
  })
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return await this.queryBus.execute(new GetMeQuery(user.userId));
  }
}
