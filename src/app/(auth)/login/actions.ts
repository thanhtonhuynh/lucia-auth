'use server';

import prisma from '@/lib/prisma';
import { loginSchema, LoginValues } from '@/lib/validation';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { verify } from '@node-rs/argon2';
import { lucia } from '@/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { User } from 'lucia';

export async function login(
  credentials: LoginValues
): Promise<{ error?: string; verifiedUser?: boolean; user?: User }> {
  try {
    const { email, password } = loginSchema.parse(credentials);

    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });
    if (!existingUser || !existingUser.passwordHash) {
      return { error: 'Invalid email or password' };
    }

    const validPassword = await verify(existingUser.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    if (!validPassword) {
      return { error: 'Invalid email or password' };
    }

    if (!existingUser.emailVerified) {
      return {
        verifiedUser: false,
        user: existingUser as User,
      };
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    redirect('/');
  } catch (error) {
    if (isRedirectError(error)) throw error;

    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}
