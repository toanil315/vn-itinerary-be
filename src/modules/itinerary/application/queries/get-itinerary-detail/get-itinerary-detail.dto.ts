import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const DetailAuthorSchema = z.object({
  displayName: z.string(),
  username: z.string(),
  avatarUrl: z.string().nullable(),
  bio: z.string().nullable(),
  isVerified: z.boolean(),
});

export const DetailActivitySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  sessionType: z.string().nullable(),
  orderIndex: z.number(),
  locationName: z.string().nullable(),
  locationAddress: z.string().nullable(),
  estimatedCost: z.number().nullable(),
  currency: z.string(),
  costDisplay: z.string().nullable(),
  mapLink: z.string().nullable(),
  categoryTag: z.string().nullable(),
  images: z.array(
    z.object({
      id: z.string().uuid(),
      objectKey: z.string(),
      url: z.string().nullable(),
      caption: z.string().nullable(),
      displayOrder: z.number(),
    }),
  ),
});

export const DetailDaySchema = z.object({
  id: z.string().uuid(),
  dayNumber: z.number(),
  theme: z.string().nullable(),
  activities: z.array(DetailActivitySchema),
});

export const ItineraryDetailSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  region: z.string(),
  duration: z.string(),
  thumbnailUrl: z.string().nullable(),
  estimatedPriceCents: z.number().nullable(),
  currency: z.string(),
  avgRating: z.number(),
  viewCount: z.number(),
  likeCount: z.number(),
  createdAt: z.string(),
  tags: z.array(z.string()),
  author: DetailAuthorSchema,
  days: z.array(DetailDaySchema),
});

export class ItineraryDetailResponse extends createZodDto(ItineraryDetailSchema) {}
