'use server';

import { forgotPasswordSchema, ForgotPasswordValues } from '@/lib/validation';
import { sendEmail } from '@/lib/email';
import { createPasswordResetToken, getUserByEmail } from '@/data/users';
import { render } from '@react-email/components';
import ResetPasswordEmail from '@/components/email/ResetPasswordEmail';
import { rateLimitByKey } from '@/lib/limiter';
import { RateLimitError } from '@/lib/errors';

// Send Password Reset Email
export async function sendPasswordResetEmail(values: ForgotPasswordValues) {
  try {
    const { email } = forgotPasswordSchema.parse(values);

    await rateLimitByKey({
      key: `forgot-password:${email}`,
      limit: 1,
      window: 60000,
    });

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
    if (error instanceof RateLimitError) {
      return {
        error: 'You can only request a password reset link once per minute.',
      };
    }
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}
