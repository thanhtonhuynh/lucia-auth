'use server';

import prisma from '@/lib/prisma';
import { loginSchema, LoginValues } from '@/lib/validation';
import { verify } from '@node-rs/argon2';
import { redirect } from 'next/navigation';
import { User } from 'lucia';
import { setSession } from '@/lib/session';

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

    await setSession(existingUser.id);
  } catch (error) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }

  redirect('/');
}
