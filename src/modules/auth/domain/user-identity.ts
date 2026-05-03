export interface UserIdentity {
  id: string;
  email: string;
  roleKey: string;
  status: string;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  roleKey: string;
}

export function isActiveUser(status: string): boolean {
  return status === 'active';
}
