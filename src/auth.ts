import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { Lucia } from 'lucia';
import prisma from './lib/prisma';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { Google } from 'arctic';

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },

  getUserAttributes: (databaseUserAttributes) => {
    return {
      id: databaseUserAttributes.id,
      email: databaseUserAttributes.email,
      emailVerified: databaseUserAttributes.emailVerified,
      name: databaseUserAttributes.name,
      image: databaseUserAttributes.image,
      role: databaseUserAttributes.role,
    };
  },
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  id: string;
  email: string | null;
  emailVerified: boolean;
  name: string;
  image: string | null;
  role: string | null;
}

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.BASE_URL}/api/auth/callback/google`
);

export const auth = cache(async () => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    return { user: null, session: null };
  }

  const { user, session } = await lucia.validateSession(sessionId);
  try {
    if (session && session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch {}

  return { user, session };
});
