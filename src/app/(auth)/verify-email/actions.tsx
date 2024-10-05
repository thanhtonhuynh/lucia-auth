'use server';

import { sendEmail } from '@/lib/email';
import prisma from '@/lib/prisma';
import {
  verificationCodeSchema,
  VerificationCodeValues,
} from '@/lib/validation';
import { render } from '@react-email/components';
import { User } from 'lucia';
import { redirect } from 'next/navigation';
import { alphabet, generateRandomString } from 'oslo/crypto';
import VerificationCodeEmail from '@/components/email/VerificationCodeEmail';
import { setSession } from '@/lib/session';
import { verifyVerificationCode } from '@/data/verify-email';
import { getUserByEmail, updateUser } from '@/data/users';
import { rateLimitByKey } from '@/lib/limiter';
import { GenericError, RateLimitError } from '@/lib/errors';

export async function verifyEmail(
  values: VerificationCodeValues,
  userId: string
): Promise<{ error?: string }> {
  try {
    await rateLimitByKey({ key: userId, limit: 3, window: 10000 });

    const { code } = verificationCodeSchema.parse(values);

    const validCode = await verifyVerificationCode(userId, code);
    if (!validCode) {
      return { error: 'Invalid verification code. Please try again.' };
    }

    await updateUser(userId, { emailVerified: true });

    await setSession(userId);
  } catch (error) {
    if (error instanceof RateLimitError) {
      return { error: 'Too many attempts. Please try again later.' };
    }
    console.error(error);
    return { error: 'Something went wrong.' };
  }

  redirect('/');
}

export async function sendEmailVerificationCode(userId: string, email: string) {
  try {
    await rateLimitByKey({ key: email, limit: 1, window: 60000 });

    const user = await getUserByEmail(email);
    if (!user || user.email !== email || user.emailVerified) {
      throw new GenericError('Invalid request');
    }

    const code = generateRandomString(6, alphabet('0-9'));

    await prisma.verificationCode.upsert({
      where: { userId },
      create: {
        userId,
        email,
        code,
        expiresAt: new Date(Date.now() + 3000), // 10 minutes
      },
      update: {
        code,
        expiresAt: new Date(Date.now() + 3000), // 10 minutes
      },
    });

    const emailHtml = await render(<VerificationCodeEmail code={code} />);

    await sendEmail({
      to: email,
      subject: 'Email Verification Code',
      html: emailHtml,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      throw Error('You can only request a verification code once per minute.');
    } else if (error instanceof GenericError) {
      throw error;
    } else {
      console.log(error);
      throw Error('Something went wrong.');
    }
  }
}
