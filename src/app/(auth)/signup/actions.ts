'use server';

import prisma from '@/lib/prisma';
import { signUpSchema, SignUpValues } from '@/lib/validation';
import { hash } from '@node-rs/argon2';
import { User } from 'lucia';
import { sendEmailVerificationCode } from '../verify-email/actions';
import { getUserByEmail } from '@/data/users';

export async function signUp(
  credentials: SignUpValues
): Promise<{ error?: string; success?: boolean; user?: User }> {
  try {
    const { email, password } = signUpSchema.parse(credentials);

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

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

    return { success: true, user };
  } catch (error) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}
