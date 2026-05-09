import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac } from 'crypto';

const CONTENT_TYPE_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
};

@Injectable()
export class R2SignerService {
  constructor(private readonly configService: ConfigService) {}

  getBucketName(): string {
    return this.configService.getOrThrow<string>('R2_BUCKET_NAME');
  }

  getUploadTtlSeconds(): number {
    return this.configService.getOrThrow<number>('R2_UPLOAD_URL_TTL_SECONDS');
  }

  createObjectKey(userId: string, uploadId: string, contentType: string): string {
    const extension = CONTENT_TYPE_TO_EXTENSION[contentType] ?? 'bin';
    return `tmp/user_${userId}/activity/${uploadId}.${extension}`;
  }

  createPresignedPutObject(input: {
    objectKey: string;
    contentType: string;
    expiresInSeconds: number;
  }): { putUrl: string; requiredHeaders: Record<string, string> } {
    const putUrl = this.signUrl({
      method: 'PUT',
      objectKey: input.objectKey,
      expiresInSeconds: input.expiresInSeconds,
      extraHeaders: {
        'content-type': input.contentType,
      },
    });

    return {
      putUrl,
      requiredHeaders: {
        'content-type': input.contentType,
      },
    };
  }

  createPresignedHeadObject(objectKey: string, expiresInSeconds = 60): string {
    return this.signUrl({
      method: 'HEAD',
      objectKey,
      expiresInSeconds,
    });
  }

  createPresignedDeleteObject(objectKey: string, expiresInSeconds = 60): string {
    return this.signUrl({
      method: 'DELETE',
      objectKey,
      expiresInSeconds,
    });
  }

  buildPublicUrl(objectKey: string): string | null {
    const base = this.configService.get<string>('R2_PUBLIC_BASE_URL');
    if (!base) {
      return null;
    }

    return `${base.replace(/\/$/, '')}/${objectKey}`;
  }

  private signUrl(input: {
    method: string;
    objectKey: string;
    expiresInSeconds: number;
    extraHeaders?: Record<string, string>;
  }): string {
    const accountId = this.configService.getOrThrow<string>('R2_ACCOUNT_ID');
    const bucketName = this.getBucketName();
    const accessKey = this.configService.getOrThrow<string>('R2_ACCESS_KEY_ID');
    const secretKey = this.configService.getOrThrow<string>('R2_SECRET_ACCESS_KEY');
    const host = `${bucketName}.${accountId}.r2.cloudflarestorage.com`;
    const endpoint = `https://${host}`;
    const now = new Date();
    const amzDate = this.toAmzDate(now);
    const dateStamp = amzDate.slice(0, 8);
    const region = 'auto';
    const service = 's3';
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

    const headers = {
      host,
      ...(input.extraHeaders ?? {}),
    };

    const signedHeaders = Object.keys(headers)
      .map((header) => header.toLowerCase())
      .sort()
      .join(';');

    const canonicalHeaders = Object.entries(headers)
      .map(([header, value]) => [header.toLowerCase(), value.trim()] as const)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([header, value]) => `${header}:${value}\n`)
      .join('');

    const query = new URLSearchParams({
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': `${accessKey}/${credentialScope}`,
      'X-Amz-Date': amzDate,
      'X-Amz-Expires': String(input.expiresInSeconds),
      'X-Amz-SignedHeaders': signedHeaders,
    });

    const canonicalUri = `/${input.objectKey
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/')}`;
    const canonicalQuery = Array.from(query.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    const payloadHash = 'UNSIGNED-PAYLOAD';

    const canonicalRequest = [
      input.method,
      canonicalUri,
      canonicalQuery,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      this.hash(canonicalRequest),
    ].join('\n');

    const signature = this.signature(secretKey, dateStamp, region, service, stringToSign);
    query.set('X-Amz-Signature', signature);
    return `${endpoint}${canonicalUri}?${query.toString()}`;
  }

  private toAmzDate(date: Date): string {
    return date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private hmac(key: Buffer | string, value: string): Buffer {
    return createHmac('sha256', key).update(value).digest();
  }

  private signature(
    secretKey: string,
    dateStamp: string,
    region: string,
    service: string,
    stringToSign: string,
  ): string {
    const kDate = this.hmac(`AWS4${secretKey}`, dateStamp);
    const kRegion = this.hmac(kDate, region);
    const kService = this.hmac(kRegion, service);
    const kSigning = this.hmac(kService, 'aws4_request');
    return createHmac('sha256', kSigning).update(stringToSign).digest('hex');
  }
}

