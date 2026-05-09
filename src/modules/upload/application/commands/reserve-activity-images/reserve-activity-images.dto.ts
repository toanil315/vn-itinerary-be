import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'] as const;

const ReserveActivityImageFileSchema = z.object({
  content_type: z.enum(ALLOWED_IMAGE_TYPES),
  size_bytes: z.number().int().positive().max(MAX_IMAGE_SIZE_BYTES),
  caption: z.string().max(255).optional(),
});

export const ReserveActivityImagesSchema = z.object({
  activity_client_ref: z.string().min(1).max(100),
  files: z.array(ReserveActivityImageFileSchema).min(1).max(5),
});

export class ReserveActivityImagesDto extends createZodDto(ReserveActivityImagesSchema) {}

const ReserveActivityImageItemSchema = z.object({
  upload_id: z.string().uuid(),
  object_key: z.string(),
  put_url: z.string().url(),
  required_headers: z.record(z.string(), z.string()),
  expires_at: z.string(),
});

export const ReserveActivityImagesResponseSchema = z.object({
  items: z.array(ReserveActivityImageItemSchema),
});

export class ReserveActivityImagesResponseDto extends createZodDto(
  ReserveActivityImagesResponseSchema,
) {}

export type ReserveActivityImagesResponse = z.infer<
  typeof ReserveActivityImagesResponseSchema
>;

