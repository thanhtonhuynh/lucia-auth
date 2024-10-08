import { validatePasswordResetToken } from '@/data/users';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  // validate token
  const dbToken = await validatePasswordResetToken(token);

  if (!dbToken) redirect('/not-found');

  cookies().set('resetToken', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });

  redirect('/reset-password');
}
