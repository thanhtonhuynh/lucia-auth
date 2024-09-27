'use server';

import { lucia } from '@/auth';
import prisma from '@/lib/prisma';
import { signUpSchema, SignUpValues } from '@/lib/validation';
import { hash } from '@node-rs/argon2';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signUp(
  credentials: SignUpValues
): Promise<{ error: string }> {
  try {
    const { email, password } = signUpSchema.parse(credentials);

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });
    if (existingEmail) {
      return { error: 'Email already in use' };
    }

    const user = await prisma.user.create({
      data: {
        name: email.split('@')[0],
        email,
        passwordHash,
      },
    });

    const session = await lucia.createSession(user.id, {});
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
