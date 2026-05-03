import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateBookmarkSchema = z.object({
  itineraryId: z.string().uuid(),
});

export class CreateBookmarkDto extends createZodDto(CreateBookmarkSchema) {}
