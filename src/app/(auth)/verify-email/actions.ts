'use server';

import { lucia } from '@/auth';
import { sendEmail } from '@/lib/email';
import prisma from '@/lib/prisma';
import {
  verificationCodeSchema,
  VerificationCodeValues,
} from '@/lib/validation';
import { User } from 'lucia';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isWithinExpirationDate } from 'oslo';
import { alphabet, generateRandomString } from 'oslo/crypto';

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

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
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

async function verifyVerificationCode(user: User, code: string) {
  const databaseCode = await prisma.verificationCode.findFirst({
    where: { userId: user.id },
  });

  if (!databaseCode || databaseCode.code !== code) {
    return false;
  }

  await prisma.verificationCode.delete({ where: { id: databaseCode.id } });

  if (!isWithinExpirationDate(databaseCode.expiresAt)) {
    return false;
  }

  if (databaseCode.email !== user.email) {
    return false;
  }

  return true;
}

export async function sendEmailVerificationCode(userId: string, email: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
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

  await sendEmail({
    to: email,
    subject: 'Email Verification Code',
    html: `
      <h1>Verification Code</h1>
      <p>Your verification code is: <strong>${code}</strong></p>
    `,
  });

  return code;
}
