import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AuthorSchema = z.object({
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
});

export const ExploreItineraryItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  duration: z.string(),
  estimatedPriceCents: z.number().nullable(),
  currency: z.string(),
  avgRating: z.number(),
  viewCount: z.number(),
  thumbnailUrl: z.string().nullable(),
  region: z.string(),
  tags: z.array(z.string()),
  author: AuthorSchema,
});

export const ListItinerariesResponseSchema = z.object({
  items: z.array(ExploreItineraryItemSchema),
  total: z.number(),
});

export class ListItinerariesResponse extends createZodDto(ListItinerariesResponseSchema) {}
