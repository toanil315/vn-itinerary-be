import { z } from 'zod';

export const ApiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema.nullish(),
    message: z.string().optional(),
  });

export const ApiFailureSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
  timestamp: z.iso.datetime(),
});

export type ApiSuccess<T> = z.infer<
  ReturnType<typeof ApiSuccessSchema<z.ZodType<T>>>
>;

export type ApiFailure = z.infer<typeof ApiFailureSchema>;
