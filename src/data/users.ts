import prisma from '@/lib/prisma';
import { User } from '@prisma/client';
import { cache } from 'react';
import { hash, verify } from '@node-rs/argon2';

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

export async function updateUser(userId: string, data: Partial<User>) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return user;
}

export async function hashPassword(plainTextPassword: string) {
  return await hash(plainTextPassword, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

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
