import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().max(100).optional(),
});

export class RegisterRequest extends createZodDto(RegisterRequestSchema) {}

export const RegisterResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
});

export class RegisterResponse extends createZodDto(RegisterResponseSchema) {}

export interface RegisterData {
  id: string;
  email: string;
}
