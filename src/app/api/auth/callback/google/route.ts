import { google, lucia } from '@/auth';
import prisma from '@/lib/prisma';
import { OAuth2RequestError } from 'arctic';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

interface GoogleUser {
  id: string;
  email: string;
  name: string;
}

async function handleSessionCookie(userId: string) {
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return new Response(null, { status: 302, headers: { Location: '/' } });
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const error = req.nextUrl.searchParams.get('error');

  const storedState = cookies().get('state')?.value;
  const storedCodeVerifier = cookies().get('code_verifier')?.value;

  // User denied access to their Google account
  if (error === 'access_denied') {
    return new Response(null, { status: 302, headers: { Location: '/login' } });
  }

  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    return new Response(null, { status: 400 });
  }

  try {
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier
    );

    const googleUser: GoogleUser = await fetch(
      'https:///www.googleapis.com/oauth2/v1/userinfo',
      { headers: { Authorization: `Bearer ${tokens.accessToken}` } }
    ).then((res) => res.json());

    const existingAccount = await prisma.account.findFirst({
      where: { providerId: googleUser.id },
    });
    if (existingAccount) {
      return handleSessionCookie(existingAccount.userId);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });
    if (existingUser) {
      await prisma.account.create({
        data: {
          provider: 'google',
          providerId: googleUser.id,
          userId: existingUser.id,
        },
      });

      return handleSessionCookie(existingUser.id);
    }

    const newUser = await prisma.user.create({
      data: {
        name: googleUser.name,
        email: googleUser.email,
        accounts: {
          create: {
            provider: 'google',
            providerId: googleUser.id,
          },
        },
      },
    });
    return handleSessionCookie(newUser.id);
  } catch (error) {
    console.error(error);
    if (error instanceof OAuth2RequestError) {
      return new Response(null, { status: 400 });
    }
    return new Response(null, { status: 500 });
  }
}
