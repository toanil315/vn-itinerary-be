import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const ActivitySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  time_session: z.enum(["morning", "lunch", "afternoon", "evening"]),
  order_index: z.number().int(),
  location_name: z.string().optional(),
  location_address: z.string().optional(),
  location_lat: z.number().optional(),
  location_lng: z.number().optional(),
  estimated_cost: z.number().optional(),
  currency: z.string().length(3).default("VND"),
  cost_display: z.string().optional(),
  map_link: z.string().url().optional(),
  category_tag: z.string().optional(),
});

export const ItineraryDaySchema = z.object({
  day_number: z.number().int().min(1),
  theme: z.string().optional(),
  order_index: z.number().int(),
  activities: z.array(ActivitySchema),
});

export const CreateItinerarySchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  region: z.string(),
  duration: z.string(),
  duration_days: z.number().int().min(1),
  thumbnail_url: z.string().url().optional(),
  estimated_price_cents: z.number().int().optional(),
  currency: z.string().length(3).default("USD"),
  tags: z.array(z.string()).optional(),
  days: z.array(ItineraryDaySchema),
});

export class CreateItineraryDto extends createZodDto(CreateItinerarySchema) {}

export const CreateItineraryResponseSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
});

export class CreateItineraryResponseDto extends createZodDto(
  CreateItineraryResponseSchema,
) {}

export type CreateItineraryResponse = z.infer<
  typeof CreateItineraryResponseSchema
>;
