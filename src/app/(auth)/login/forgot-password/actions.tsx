'use server';

import prisma from '@/lib/prisma';
import { generateIdFromEntropySize } from 'lucia';
import { encodeHex } from 'oslo/encoding';
import { sha256 } from 'oslo/crypto';
import { TimeSpan, createDate } from 'oslo';
import { forgotPasswordSchema, ForgotPasswordValues } from '@/lib/validation';
import { sendEmail } from '@/lib/email';
import { getUserByEmail } from '@/data/users';
import { render } from '@react-email/components';
import ResetPasswordEmail from '@/components/email/ResetPasswordEmail';

async function createPasswordResetToken(userId: string) {
  // create new token
  const token = generateIdFromEntropySize(25); // 40 characters
  const tokenHash = encodeHex(await sha256(new TextEncoder().encode(token)));

  // invalidate any existing tokens
  await prisma.passwordResetToken.deleteMany({
    where: { userId },
  });

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

export async function sendPasswordResetEmail(values: ForgotPasswordValues) {
  try {
    const { email } = forgotPasswordSchema.parse(values);

    const user = await getUserByEmail(email);
    if (!user) return { success: true };

    const token = await createPasswordResetToken(user.id);

    const emailHtml = await render(<ResetPasswordEmail token={token} />);

    // send email with verification link
    await sendEmail({
      to: email,
      subject: 'Reset password request',
      html: emailHtml,
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}
