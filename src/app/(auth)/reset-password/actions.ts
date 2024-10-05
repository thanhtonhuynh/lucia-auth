'use server';

import { lucia } from '@/auth';
import prisma from '@/lib/prisma';
import { resetPasswordSchema, ResetPasswordValues } from '@/lib/validation';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { setSession } from '@/lib/session';
import { rateLimitByIp } from '@/lib/limiter';
import { RateLimitError } from '@/lib/errors';
import {
  hashPassword,
  updateUser,
  validatePasswordResetToken,
} from '@/data/users';

export async function resetPassword(values: ResetPasswordValues) {
  try {
    await rateLimitByIp({ key: 'change-password', limit: 2, window: 30000 });

    // get token from cookie
    const token = cookies().get('resetToken')?.value || '';

    const { password } = resetPasswordSchema.parse(values);

    const dbToken = await validatePasswordResetToken(token);

    if (dbToken)
      await prisma.passwordResetToken.delete({
        where: { tokenHash: dbToken.tokenHash },
      });

    if (!dbToken) {
      return { error: 'Invalid or expired token' };
    }

    await lucia.invalidateUserSessions(dbToken.userId);

    const passwordHash = await hashPassword(password);

    await updateUser(dbToken.userId, { passwordHash });

    await setSession(dbToken.userId);

    cookies().delete('resetToken');
  } catch (error) {
    if (error instanceof RateLimitError) {
      return { error: 'Too many attempts, please try again later.' };
    }
    console.error(error);
    return { error: 'Something went wrong' };
  }

  redirect('/');
}
