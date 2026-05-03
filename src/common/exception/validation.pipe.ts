import { createZodValidationPipe } from 'nestjs-zod';
import { ValidationException } from './validation.exception';
import z from 'zod';

export const RequestValidationPipe: ReturnType<typeof createZodValidationPipe> =
  createZodValidationPipe({
    createValidationException: (error: unknown) =>
      new ValidationException(error as z.ZodError),
  });
