import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const EmptyResponseSchema = z.object({});

export class EmptyResponse extends createZodDto(EmptyResponseSchema) {}
