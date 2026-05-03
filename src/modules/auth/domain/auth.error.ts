import { BusinessError } from '@/common/domain/error';

export namespace AuthErrors {
  export const InvalidCredentials = () =>
    BusinessError.Problem(
      'AUTH.INVALID_CREDENTIALS',
      'Invalid email or password',
    );

  export const InactiveUser = () =>
    BusinessError.Problem('AUTH.INACTIVE_USER', 'User account is inactive');

  export const EmailAlreadyExists = () =>
    BusinessError.Conflict('AUTH.EMAIL_ALREADY_EXISTS', 'Email is already in use');

  export const UsernameTaken = () =>
    BusinessError.Conflict('AUTH.USERNAME_TAKEN', 'Username is already taken');
}
