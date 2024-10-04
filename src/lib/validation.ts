import { z } from 'zod';

const requiredString = z.string().trim().min(1, 'Required');

// Sign up
export const signUpSchema = z.object({
  email: requiredString.email('Invalid email address'),
  password: requiredString.min(8, 'Password must be at least 8 characters'),
});
export type SignUpValues = z.infer<typeof signUpSchema>;

// Login
export const loginSchema = z.object({
  email: requiredString.email('Invalid email address'),
  password: requiredString,
});
export type LoginValues = z.infer<typeof loginSchema>;

// Update profile
export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, 'Cannot be empty'),
});
export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

// Verification code
export const verificationCodeSchema = z.object({
  code: z.string().length(6, 'Invalid verification code'),
});
export type VerificationCodeValues = z.infer<typeof verificationCodeSchema>;

// Forgot password
export const forgotPasswordSchema = z.object({
  email: requiredString.email('Invalid email address'),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

// Reset password
export const resetPasswordSchema = z
  .object({
    password: requiredString.min(8, 'Password must be at least 8 characters'),
    confirmPassword: requiredString.min(
      8,
      'Password must be at least 8 characters'
    ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
