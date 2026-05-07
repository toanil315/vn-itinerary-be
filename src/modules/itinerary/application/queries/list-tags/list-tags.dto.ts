import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const TagItemSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export class ListTagsResponse extends createZodDto(z.array(TagItemSchema)) {}
