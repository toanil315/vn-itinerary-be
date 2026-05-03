import { Injectable } from '@nestjs/common';
import { PermissionKey, PermissionKeys } from './permission-key';
import { RoleKey, RoleKeys } from './role-key';

const ALL_PERMISSIONS: readonly PermissionKey[] = Object.values(PermissionKeys);

const ROLE_PERMISSION_POLICY: Readonly<
  Record<RoleKey, readonly PermissionKey[]>
> = {
  [RoleKeys.SUPER_ADMIN]: ALL_PERMISSIONS,
  [RoleKeys.USER]: [
    PermissionKeys.ITINERARY_CREATE,
    PermissionKeys.ITINERARY_UPDATE,
    PermissionKeys.ITINERARY_PUBLISH,
    PermissionKeys.ITINERARY_ARCHIVE,
    PermissionKeys.ITINERARY_LIST_OWN,
    PermissionKeys.BOOKMARK_CREATE,
    PermissionKeys.BOOKMARK_DELETE,
    PermissionKeys.BOOKMARK_LIST,
    PermissionKeys.AUTH_PROFILE,
  ],
};

@Injectable()
export class RolePermissionPolicy {
  hasPermission(roleKey: string, permission: PermissionKey): boolean {
    const policy = ROLE_PERMISSION_POLICY[roleKey as RoleKey];
    if (!policy) {
      return false;
    }

    return policy.includes(permission);
  }

  getPermissionsByRole(roleKey: string): readonly PermissionKey[] {
    return ROLE_PERMISSION_POLICY[roleKey as RoleKey] ?? [];
  }
}
