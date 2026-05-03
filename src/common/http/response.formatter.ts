import { ApiFailure, ApiSuccess } from './response.schema';

export class ResponseFormatter {
  static success<T>(data: T, message?: string): ApiSuccess<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  static failure(code: string, message: string, details?: unknown): ApiFailure {
    return {
      success: false,
      error: { code, message, details },
      timestamp: new Date().toISOString(),
    };
  }
}
