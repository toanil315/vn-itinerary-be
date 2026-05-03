import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const MyItineraryItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  status: z.string(),
  updated_at: z.string(),
  thumbnail_url: z.string().nullable(),
  region: z.string(),
});

export const ListMyItinerariesResponseSchema = z.object({
  items: z.array(MyItineraryItemSchema),
  total: z.number(),
});

export class ListMyItinerariesResponse extends createZodDto(ListMyItinerariesResponseSchema) {}
