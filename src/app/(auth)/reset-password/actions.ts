'use server';

import { lucia } from '@/auth';
import prisma from '@/lib/prisma';
import { resetPasswordSchema, ResetPasswordValues } from '@/lib/validation';
import { sha256 } from 'oslo/crypto';
import { encodeHex } from 'oslo/encoding';
import { hash } from '@node-rs/argon2';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { setSession } from '@/lib/session';

export async function resetPassword(values: ResetPasswordValues) {
  try {
    // get token from cookie
    const token = cookies().get('resetToken')?.value;

    const { password } = resetPasswordSchema.parse(values);

    // validate token
    const tokenHash = encodeHex(await sha256(new TextEncoder().encode(token)));
    const dbToken = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (dbToken)
      await prisma.passwordResetToken.delete({ where: { tokenHash } });

    if (!dbToken) {
      return { error: 'Invalid or expired token' };
    }

    await lucia.invalidateUserSessions(dbToken.userId);
    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    await prisma.user.update({
      where: { id: dbToken.userId },
      data: { passwordHash },
    });

    await setSession(dbToken.userId);
    cookies().delete('resetToken');
  } catch (error) {
    console.error(error);
    return { error: 'Something went wrong' };
  }

  redirect('/');
}
