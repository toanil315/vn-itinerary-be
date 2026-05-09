import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const ExploreItineraryItemSchema = z.object({
  id: z.uuid(),
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
});

export const ListItinerariesResponseSchema = z.object({
  items: z.array(ExploreItineraryItemSchema),
  total: z.number(),
});

export class ListItinerariesResponse extends createZodDto(
  ListItinerariesResponseSchema,
) {}
