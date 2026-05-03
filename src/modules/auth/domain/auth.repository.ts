import { UserIdentity } from './user-identity';

export interface AuthUserRecord extends UserIdentity {
  passwordHash: string;
}

export abstract class AuthRepository {
  abstract findByEmail(email: string): Promise<AuthUserRecord | null>;
  abstract findByUsername(username: string): Promise<AuthUserRecord | null>;
  abstract createUser(data: {
    email: string;
    username: string;
    passwordHash: string;
    displayName: string;
  }): Promise<{ id: string; email: string }>;
  abstract findUserProfile(id: string): Promise<{
    id: string;
    username: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    bio: string | null;
    isVerified: boolean;
    roleKey: string;
  } | null>;
}
