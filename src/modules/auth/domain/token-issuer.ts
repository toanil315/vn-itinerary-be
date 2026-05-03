export interface AccessTokenPayload {
  sub: string;
  email: string;
  roleKey: string;
}

export interface AccessTokenIssueResult {
  accessToken: string;
  expiresInSeconds: number;
}

export abstract class TokenIssuer {
  abstract issueAccessToken(
    payload: AccessTokenPayload,
  ): Promise<AccessTokenIssueResult>;

  abstract verifyAccessToken(token: string): Promise<AccessTokenPayload>;
}
