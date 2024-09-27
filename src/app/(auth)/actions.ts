'use server';

import { auth, lucia } from '@/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout() {
  const { session } = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  redirect('/');
}
