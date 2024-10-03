'use server';

import { lucia } from '@/auth';
import prisma from '@/lib/prisma';
import { resetPasswordSchema, ResetPasswordValues } from '@/lib/validation';
import { sha256 } from 'oslo/crypto';
import { encodeHex } from 'oslo/encoding';
import { hash } from '@node-rs/argon2';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function resetPassword(
  values: ResetPasswordValues,
  verificationToken: string
) {
  try {
    const { password } = resetPasswordSchema.parse(values);

    // validate token
    const tokenHash = encodeHex(
      await sha256(new TextEncoder().encode(verificationToken))
    );
    const token = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (token) await prisma.passwordResetToken.delete({ where: { tokenHash } });

    if (!token) {
      return { error: 'Invalid or expired token' };
    }

    await lucia.invalidateUserSessions(token.userId);
    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    await prisma.user.update({
      where: { id: token.userId },
      data: { passwordHash },
    });

    const session = await lucia.createSession(token.userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  } catch (error) {
    console.error(error);
    return { error: 'Something went wrong' };
  }

  redirect('/');
}
