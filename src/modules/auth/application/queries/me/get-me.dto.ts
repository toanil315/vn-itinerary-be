import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UserProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  bio: z.string().nullable(),
  isVerified: z.boolean(),
  roleKey: z.string(),
});

export class UserProfileResponse extends createZodDto(UserProfileSchema) {}

export type UserProfileData = z.infer<typeof UserProfileSchema>;
