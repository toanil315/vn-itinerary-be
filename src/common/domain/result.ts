import { BusinessError } from './error';

export class Result<T> {
  constructor(
    public readonly value: T,
    public readonly businessError?: BusinessError,
  ) {
    if (
      (Boolean(value) && Boolean(businessError)) ||
      (!Boolean(value) && !Boolean(businessError))
    ) {
      throw new Error('Invalid Result state');
    }

    Object.setPrototypeOf(this, new.target.prototype);
  }

  static success<T>(value: T): Result<T> {
    return new Result(value, undefined);
  }

  static failure<T = never>(error: BusinessError): Result<T> {
    return new Result<T>(undefined as never, error);
  }

  get isSuccess(): boolean {
    return !Boolean(this.businessError);
  }
}
