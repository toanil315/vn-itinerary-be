export const RoleKeys = {
  SUPER_ADMIN: 'super_admin',
  USER: 'user',
} as const;

export type RoleKey = (typeof RoleKeys)[keyof typeof RoleKeys];
