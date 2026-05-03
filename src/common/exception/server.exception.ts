export class ServerException extends Error {
  static readonly code = 'VB_SERVER_ERROR';
  public readonly details?: unknown;

  constructor(message: string = 'Server Error', details?: unknown) {
    super(message);
    this.details = details;

    Object.setPrototypeOf(this, ServerException.prototype);
  }
}
