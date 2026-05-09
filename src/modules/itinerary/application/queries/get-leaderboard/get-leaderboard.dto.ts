import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const LeaderboardAuthorSchema = z.object({
  displayName: z.string(),
  username: z.string(),
  avatarUrl: z.string().nullable(),
});

export const LeaderboardItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  thumbnailUrl: z.string().nullable(),
  viewCount: z.number(),
});

export const LeaderboardResponseSchema = z.object({
  items: z.array(LeaderboardItemSchema),
});

export class LeaderboardResponse extends createZodDto(
  LeaderboardResponseSchema,
) {}
