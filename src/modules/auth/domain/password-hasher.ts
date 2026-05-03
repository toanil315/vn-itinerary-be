export abstract class PasswordHasher {
  abstract hash(plainText: string): Promise<string>;
  abstract verify(plainText: string, hash: string): Promise<boolean>;
}
