import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z.email().describe('Admin account email'),
  password: z.string().min(1).describe('Admin account password'),
});

export class LoginRequest extends createZodDto(LoginRequestSchema) {}

const LoginDataSchema = z.object({
  accessToken: z.string(),
  tokenType: z.literal('Bearer'),
  expiresInSeconds: z.number().int().positive(),
});

export type LoginData = z.infer<typeof LoginDataSchema>;

export class LoginResponse extends createZodDto(
  (LoginDataSchema),
) {}
