import prisma from '@/lib/prisma';
import { User } from '@prisma/client';
import { cache } from 'react';
import { hash, verify } from '@node-rs/argon2';
import { generateIdFromEntropySize } from 'lucia';
import { encodeHex } from 'oslo/encoding';
import { sha256 } from 'oslo/crypto';
import { createDate, TimeSpan } from 'oslo';

// Get User By Email
export const getUserByEmail = cache(async (email: string) => {
  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: 'insensitive',
      },
    },
  });

  return user;
});

// Update User
export async function updateUser(userId: string, data: Partial<User>) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return user;
}

// Hash Password
export async function hashPassword(plainTextPassword: string) {
  return await hash(plainTextPassword, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

// Verify Password
export async function verifyPassword(
  passwordHash: string,
  plainTextPassword: string
) {
  return await verify(passwordHash, plainTextPassword, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

// Create Password Reset Token
export async function createPasswordResetToken(userId: string) {
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

// Validate Password Reset Token
export async function validatePasswordResetToken(token: string) {
  const tokenHash = encodeHex(await sha256(new TextEncoder().encode(token)));
  const dbToken = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      expiresAt: {
        gte: new Date(),
      },
    },
  });

  return dbToken;
}
