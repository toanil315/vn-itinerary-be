import { z } from 'zod';

export class ValidationException extends Error {
  static readonly code = 'VB_VALIDATION_ERROR';
  public readonly details?: unknown;

  constructor(error: z.ZodError, message: string = 'Validation failed') {
    super(message);
    this.details = this.formatError(error);

    Object.setPrototypeOf(this, ValidationException.prototype);
  }

  formatError(error: z.ZodError) {
    return z.flattenError(error);
  }
}
