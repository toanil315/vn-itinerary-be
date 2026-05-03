import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PasswordHasher } from '@/modules/auth/domain/password-hasher';

@Injectable()
export class Argon2PasswordHasherImpl implements PasswordHasher {
  async hash(plainText: string): Promise<string> {
    return await argon2.hash(plainText);
  }

  async verify(plainText: string, hash: string): Promise<boolean> {
    return await argon2.verify(hash, plainText);
  }
}
