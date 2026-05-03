import { Injectable, Inject } from '@nestjs/common';
import { Kysely } from 'kysely';
import { DATABASE_TOKEN } from '@/common/database/database.provider';
import { DB } from '@/common/database/generated';
import {
  AuthRepository,
  AuthUserRecord,
} from '@/modules/auth/domain/auth.repository';

@Injectable()
export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: Kysely<DB>,
  ) {}

  async findByEmail(email: string): Promise<AuthUserRecord | null> {
    const row = await this.db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      status: row.status,
      roleKey: row.role_key,
    };
  }

  async findByUsername(username: string): Promise<AuthUserRecord | null> {
    const row = await this.db
      .selectFrom('users')
      .selectAll()
      .where('username', '=', username)
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      status: row.status,
      roleKey: row.role_key,
    };
  }

  async createUser(data: {
    email: string;
    username: string;
    passwordHash: string;
    displayName: string;
  }): Promise<{ id: string; email: string }> {
    const row = await this.db
      .insertInto('users')
      .values({
        email: data.email,
        username: data.username,
        password_hash: data.passwordHash,
        display_name: data.displayName,
      })
      .returning(['id', 'email'])
      .executeTakeFirstOrThrow();

    return {
      id: row.id,
      email: row.email,
    };
  }

  async findUserProfile(id: string): Promise<{
    id: string;
    username: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    bio: string | null;
    isVerified: boolean;
    roleKey: string;
  } | null> {
    const row = await this.db
      .selectFrom('users')
      .select([
        'id',
        'username',
        'email',
        'display_name',
        'avatar_url',
        'bio',
        'is_verified',
        'role_key',
      ])
      .where('id', '=', id)
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      bio: row.bio,
      isVerified: row.is_verified,
      roleKey: row.role_key,
    };
  }
}
