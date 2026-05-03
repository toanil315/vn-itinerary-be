export interface BusinessErrorOptions {
  code: string;
  message: string;
  details?: unknown;
}

export enum ErrorType {
  Problem,
  NotFound,
  Conflict,
}

export class BusinessError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly type: ErrorType,
    public readonly details?: unknown,
  ) {
    super(message);
    this.code = code;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
  }

  static Problem(code: string, message: string, details?: unknown) {
    return new BusinessError(code, message, ErrorType.Problem, details);
  }

  static NotFound(code: string, message: string, details?: unknown) {
    return new BusinessError(code, message, ErrorType.NotFound, details);
  }

  static Conflict(code: string, message: string, details?: unknown) {
    return new BusinessError(code, message, ErrorType.Conflict, details);
  }
}
