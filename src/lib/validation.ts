import { z } from 'zod';

const requiredString = z.string().trim().min(1, 'Required');

export const signUpSchema = z.object({
  email: requiredString.email('Invalid email address'),
  password: requiredString.min(8, 'Password must be at least 8 characters'),
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: requiredString.email('Invalid email address'),
  password: requiredString,
});

export type LoginValues = z.infer<typeof loginSchema>;

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, 'Cannot be empty'),
});

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
