import { Injectable } from '@nestjs/common';
import { PermissionKey } from '@/modules/auth/application/policy/permission-key';
import { RolePermissionPolicy } from '@/modules/auth/application/policy/role-permission.policy';

@Injectable()
export class PermissionCheckService {
  constructor(private readonly rolePermissionPolicy: RolePermissionPolicy) {}

  hasPermission(roleKey: string, permission: PermissionKey): boolean {
    return this.rolePermissionPolicy.hasPermission(roleKey, permission);
  }
}
