'use server';

import prisma from '@/lib/prisma';
import { signUpSchema, SignUpValues } from '@/lib/validation';
import { User } from 'lucia';
import { sendEmailVerificationCode } from '../verify-email/actions';
import { getUserByEmail, hashPassword } from '@/data/users';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { rateLimitByIp } from '@/lib/limiter';
import { RateLimitError } from '@/lib/errors';

export async function signUp(credentials: SignUpValues) {
  try {
    await rateLimitByIp({ key: 'signup', limit: 1, window: 10000 });

    const { email, password } = signUpSchema.parse(credentials);

    const passwordHash = await hashPassword(password);

    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return { error: 'Email already in use' };
    }

    const user: User = await prisma.user.create({
      data: {
        name: email.split('@')[0],
        email,
        passwordHash,
      },
    });

    await sendEmailVerificationCode(user.id, email);

    redirect(`/verify-email?email=${user.email}&redirectFrom=signup`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof RateLimitError) {
      return { error: 'Too many attempts. Please try again later.' };
    }
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}
