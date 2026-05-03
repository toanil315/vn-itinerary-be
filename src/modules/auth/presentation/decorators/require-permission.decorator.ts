import { SetMetadata } from '@nestjs/common';
import { PermissionKey } from '@/modules/auth/application/policy/permission-key';

export const REQUIRED_PERMISSION = 'requiredPermission';

export const RequirePermission = (permission: PermissionKey) =>
  SetMetadata(REQUIRED_PERMISSION, permission);
