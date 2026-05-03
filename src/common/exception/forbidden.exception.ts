export class ForbiddenException extends Error {
  static readonly code = 'VB_FORBIDDEN_ERROR';
  readonly details?: unknown;

  constructor(message: string = 'Forbidden', details?: unknown) {
    super(message);
    this.details = details;

    Object.setPrototypeOf(this, ForbiddenException.prototype);
  }
}
