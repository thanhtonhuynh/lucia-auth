'use server';

import { loginSchema, LoginValues } from '@/lib/validation';
import { redirect } from 'next/navigation';
import { User } from 'lucia';
import { setSession } from '@/lib/session';
import { getUserByEmail, verifyPassword } from '@/data/users';

export async function login(
  credentials: LoginValues
): Promise<{ error?: string; verifiedUser?: boolean; user?: User }> {
  try {
    const { email, password } = loginSchema.parse(credentials);

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
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }

  redirect('/');
}
