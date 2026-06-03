import { z } from 'zod';

export const loginRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const registerRequestSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must contain at least 8 characters.'),
  interest: z.string().trim().min(1).default('commerce'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
