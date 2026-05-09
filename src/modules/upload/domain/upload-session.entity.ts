export enum UploadSessionStatus {
  RESERVED = 'reserved',
  UPLOADED = 'uploaded',
  CONFIRMED = 'confirmed',
  EXPIRED = 'expired',
  REJECTED = 'rejected',
}

export interface UploadSession {
  id: string;
  userId: string;
  objectKey: string;
  bucket: string;
  status: UploadSessionStatus;
  contentType: string;
  maxSizeBytes: number;
  sizeBytes: number | null;
  expiresAt: Date;
  uploadedAt: Date | null;
  confirmedAt: Date | null;
  consumedAt: Date | null;
}

