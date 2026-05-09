import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ConfirmActivityImagesSchema = z.object({
  upload_ids: z.array(z.string().uuid()).min(1).max(20),
});

export class ConfirmActivityImagesDto extends createZodDto(ConfirmActivityImagesSchema) {}

const ConfirmedUploadItemSchema = z.object({
  upload_id: z.string().uuid(),
  object_key: z.string(),
  content_type: z.string(),
  size_bytes: z.number().int().positive(),
  confirmed_at: z.string(),
});

export const ConfirmActivityImagesResponseSchema = z.object({
  items: z.array(ConfirmedUploadItemSchema),
});

export class ConfirmActivityImagesResponseDto extends createZodDto(
  ConfirmActivityImagesResponseSchema,
) {}

export type ConfirmActivityImagesResponse = z.infer<
  typeof ConfirmActivityImagesResponseSchema
>;

