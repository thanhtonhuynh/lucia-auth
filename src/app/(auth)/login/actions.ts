'use server';

import { loginSchema, LoginValues } from '@/lib/validation';
import { redirect } from 'next/navigation';
import { User } from 'lucia';
import { setSession } from '@/lib/session';
import { getUserByEmail, verifyPassword } from '@/data/users';
import { rateLimitByKey } from '@/lib/limiter';
import { RateLimitError } from '@/lib/errors';

export async function login(
  credentials: LoginValues
): Promise<{ error?: string; verifiedUser?: boolean; user?: User }> {
  try {
    const { email, password } = loginSchema.parse(credentials);

    await rateLimitByKey({ key: email, limit: 3, window: 10000 });

    const existingUser = await getUserByEmail(email);
    if (!existingUser || !existingUser.passwordHash) {
      return { error: 'Invalid email or password' };
    }

    const validPassword = await verifyPassword(
      existingUser.passwordHash,
      password
    );
    if (!validPassword) {
      return { error: 'Invalid email or password' };
    }

    if (!existingUser.emailVerified) {
      return {
        verifiedUser: false,
        user: existingUser as User,
      };
    }

    await setSession(existingUser.id);
  } catch (error) {
    if (error instanceof RateLimitError) {
      return { error: 'Too many login attempts. Please try again later.' };
    }
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }

  redirect('/');
}
