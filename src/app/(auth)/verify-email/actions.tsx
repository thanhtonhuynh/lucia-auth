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

export async function verifyEmail(
  values: VerificationCodeValues,
  user: User
): Promise<{ error?: string }> {
  try {
    const { code } = verificationCodeSchema.parse(values);

    const validCode = await verifyVerificationCode(user, code);
    if (!validCode) {
      return { error: 'Invalid verification code' };
    }

    await updateUser(user.id, { emailVerified: true });

    await setSession(user.id);
  } catch (error) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }

  redirect('/');
}

export async function sendEmailVerificationCode(userId: string, email: string) {
  const user = await getUserByEmail(email);
  if (!user || user.email !== email || user.emailVerified) {
    throw new Error('Invalid request');
  }

  // Check if a code was sent in the last minute
  const lastCode = await prisma.verificationCode.findFirst({
    where: { userId },
  });
  if (
    lastCode &&
    new Date(lastCode.updatedAt) > new Date(Date.now() - 1000 * 60) &&
    new Date(lastCode.updatedAt).getTime() !==
      new Date(lastCode.createdAt).getTime()
  ) {
    throw new Error('Email sent in the last minute');
  }

  const code = generateRandomString(6, alphabet('0-9'));

  await prisma.verificationCode.upsert({
    where: { userId },
    create: {
      userId,
      email,
      code,
      expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes
    },
    update: {
      code,
      expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes
    },
  });

  const emailHtml = await render(<VerificationCodeEmail code={code} />);

  await sendEmail({
    to: email,
    subject: 'Email Verification Code',
    html: emailHtml,
  });
}
