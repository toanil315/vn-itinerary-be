import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_ROUTE } from '@/modules/auth/presentation/decorators/public.decorator';
import { REQUIRED_PERMISSION } from '@/modules/auth/presentation/decorators/require-permission.decorator';
import { PermissionCheckService } from '@/modules/auth/application/policy/permission-check.service';
import { PermissionKey } from '@/modules/auth/application/policy/permission-key';
import { AuthenticatedUser } from '@/modules/auth/domain/user-identity';
import { ForbiddenException } from '@/common/exception/forbidden.exception';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionCheckService: PermissionCheckService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_ROUTE,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const requiredPermission = this.reflector.getAllAndOverride<PermissionKey>(
      REQUIRED_PERMISSION,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      throw new ForbiddenException(
        'Permission metadata is required for private routes',
      );
    }

    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
    }>();

    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }

    const hasPermission = this.permissionCheckService.hasPermission(
      request.user.roleKey,
      requiredPermission,
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permission');
    }

    return true;
  }
}
