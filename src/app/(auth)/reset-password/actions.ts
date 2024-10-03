'use server';

import prisma from '@/lib/prisma';
import { generateIdFromEntropySize } from 'lucia';
import { encodeHex } from 'oslo/encoding';
import { sha256 } from 'oslo/crypto';
import { TimeSpan, createDate } from 'oslo';
import { forgotPasswordSchema, ForgotPasswordValues } from '@/lib/validation';
import { sendEmail } from '@/lib/email';

async function createPasswordResetToken(userId: string) {
  // invalidate any existing tokens
  await prisma.passwordResetToken.deleteMany({
    where: { userId },
  });

  // create new token
  const token = generateIdFromEntropySize(25); // 40 characters
  const tokenHash = encodeHex(await sha256(new TextEncoder().encode(token)));

  // save token to database
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: createDate(new TimeSpan(2, 'h')),
    },
  });

  return token;
}

export async function resetPassword(values: ForgotPasswordValues) {
  try {
    const { email } = forgotPasswordSchema.parse(values);

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });
    if (!user) {
      return { success: true };
    }

    const token = await createPasswordResetToken(user.id);
    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${token}`;

    // send email with verification link
    await sendEmail({
      to: email,
      subject: 'Reset your password',
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}
