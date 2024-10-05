import { google } from '@/auth';
import prisma from '@/lib/prisma';
import { setSession } from '@/lib/session';
import { OAuth2RequestError } from 'arctic';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

interface GoogleUser {
  id: string;
  email: string;
  name: string;
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
    // If the user already has an account, log them in
    if (existingAccount) {
      await setSession(existingAccount.userId);
      return new Response(null, { status: 302, headers: { Location: '/' } });
    }

    // If the user doesn't have an account, check if there's a user with the same email
    const existingUser = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });
    // If there's a user with the same email, link the Google account to the user
    if (existingUser) {
      await prisma.account.create({
        data: {
          provider: 'google',
          providerId: googleUser.id,
          userId: existingUser.id,
        },
      });

      await setSession(existingUser.id);
      return new Response(null, { status: 302, headers: { Location: '/' } });
    }

    // If there's no user with the same email, create a new user and link the Google account
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

    await setSession(newUser.id);
    return new Response(null, { status: 302, headers: { Location: '/' } });
  } catch (error) {
    console.error(error);
    if (error instanceof OAuth2RequestError) {
      return new Response(null, { status: 400 });
    }
    return new Response(null, { status: 500 });
  }
}
